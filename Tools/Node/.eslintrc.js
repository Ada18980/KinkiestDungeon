"use strict";
module.exports = {
	env: {
		browser: true,
		es6: true,
	},
	parserOptions: {
		ecmaVersion: 2018,
	},
	plugins: [
		'sort-keys-custom',
	],
	rules: {},
	overrides: [
		{
			files: ['Female3DCG.js'],
			rules: {
				'sort-keys-custom/sort-keys-custom': [
					'warn', [
						// Object key sort order for assets and asset groups
						'Name', // Assets
						'Group', // Asset Groups
						'ParentGroup', // Asset Groups
						'ParentSize', // Asset Groups
						'ParentColor', // Asset Groups
						'Category', // Asset Groups
						'Priority', // Both
						'Value', // Assets
						'Difficulty', // Assets
						'SelfBondage', // Assets
						'Time', // Assets
						'RemoveTime', // Assets
						'Enable', // Assets
						'Visible', // Assets
						'Default', // Asset Groups
						'Clothing', // Asset Groups
						'Underwear', // Asset Groups
						'Random', // Both
						'Wear', // Assets
						'IsRestraint', // Both
						'AllowLock', // Assets
						'OwnerOnly', // Assets
						'LoverOnly', // Assets
						'Blink', // Asset Groups
						'Left', // Both
						'Top', // Both
						'DefaultColor', // Assets
						'BuyGroup', // Assets
						'Prerequisite', // Assets
						'Hide', // Assets
						'HideItem', // Assets
						'FullAlpha', // Asset Groups
						'AllowNone', // Asset Groups
						'AllowColorize', // Asset Groups
						'AllowCustomize', // Asset Groups
						'AllowPose', // Both
						'SetPose', // Both
						'Effect', // Both
						'Zone', // Asset Groups
						'Activity', // Both
					], 'asc',
				],
			},
		},
	],
};
