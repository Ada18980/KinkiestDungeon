import * as ts from 'typescript';
import * as path from 'path';
import { typeValidators } from './type-validators';

// --- Framework ---

interface Diagnostic {
	file: string;
	line: number;
	col: number;
	message: string;
}

const diagnostics: Diagnostic[] = [];

// --- Core Logic ---

/**
 * Given a property assignment node, resolve the declared type annotation name
 * from the interface/type definition (not the resolved type, which would just be "string").
 */
function getDeclaredTypeAliasName(prop: ts.PropertyAssignment, checker: ts.TypeChecker): string | undefined {
	const objectLiteral = prop.parent;
	if (!ts.isObjectLiteralExpression(objectLiteral)) return undefined;

	const contextualType = checker.getContextualType(objectLiteral);
	if (!contextualType) return undefined;

	const propName = prop.name.getText();
	const propSymbol = contextualType.getProperty(propName);
	if (!propSymbol) return undefined;

	// Walk to the declaration to read the type annotation text
	const decl = propSymbol.declarations?.[0];
	if (!decl) return undefined;

	// Property signature: `aura?: HexColor`
	if (ts.isPropertySignature(decl) && decl.type) {
		return decl.type.getText();
	}
	// Property declaration: `aura: HexColor`
	if (ts.isPropertyDeclaration(decl) && decl.type) {
		return decl.type.getText();
	}

	return undefined;
}

function visitNode(node: ts.Node, checker: ts.TypeChecker, sourceFile: ts.SourceFile, relPath: string) {
	// Only care about string literals inside property assignments
	if (ts.isStringLiteral(node)) {
		const parent = node.parent;
		if (parent && ts.isPropertyAssignment(parent) && parent.initializer === node) {
			const typeName = getDeclaredTypeAliasName(parent, checker);
			if (typeName) {
				const validator = typeValidators[typeName];
				if (validator && !validator.validate(node.text)) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
					diagnostics.push({
						file: relPath,
						line: line + 1,
						col: character + 1,
						message: `Invalid ${typeName} "${node.text}" — expected ${validator.expected}`,
					});
				}
			}
		}
	}

	ts.forEachChild(node, child => visitNode(child, checker, sourceFile, relPath));
}

// --- Runner ---

function run() {
	const projectDir = path.resolve(__dirname, '..');
	const configPath = ts.findConfigFile(projectDir, ts.sys.fileExists, 'tsconfig.json');
	if (!configPath) {
		console.error('Could not find tsconfig.json');
		process.exit(1);
	}

	const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
	if (configFile.error) {
		console.error('Error reading tsconfig.json:', ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'));
		process.exit(1);
	}

	const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, projectDir);
	const program = ts.createProgram(parsed.fileNames, parsed.options);
	const checker = program.getTypeChecker();

	for (const sourceFile of program.getSourceFiles()) {
		if (sourceFile.isDeclarationFile) continue;
		if (sourceFile.fileName.includes('node_modules')) continue;

		const relPath = path.relative(projectDir, sourceFile.fileName);
		visitNode(sourceFile, checker, sourceFile, relPath);
	}

	if (diagnostics.length === 0) {
		console.log('static-analysis: no issues found');
		process.exit(0);
	}

	for (const d of diagnostics) {
		console.log(`${d.file}:${d.line}:${d.col} - ${d.message}`);
	}

	console.log(`\nFound ${diagnostics.length} issue(s)`);
	process.exit(1);
}

run();
