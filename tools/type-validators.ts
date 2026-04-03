// Maps custom type alias names to validation callbacks.
// The static analysis tool resolves the declared type annotation of each
// string literal's target property and runs the matching validator.
//
// Add new entries here to extend validation to other custom types.

export interface TypeValidator {
	/** Regex or function that checks the literal value */
	validate: (value: string) => boolean;
	/** Human-readable expectation for error messages */
	expected: string;
}

export const typeValidators: Record<string, TypeValidator> = {
	HexColor: {
		validate: (v) => /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?([0-9a-fA-F]{2})?$/.test(v),
		expected: '#RGB, #RRGGBB, or #RRGGBBAA',
	},
};
