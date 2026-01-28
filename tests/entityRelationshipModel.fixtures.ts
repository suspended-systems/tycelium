/**
 * Example fixtures demonstrating the Entity-Relationship Model data structure.
 * Based on the Big Bank plc example from the C4 model.
 */

import {
	ERM,
	EntityRelationshipTriplet,
	parseEntityRelationshipTriplets,
	edgesOfName,
	edgesOfNode,
	edgesOfNodes,
} from "../src/entityRelationshipModel";
import { arrayable as oneOrMany } from "../src/arrayable";

const BigBankPlc = { name: "Big Bank plc" } as const;

export const PersonalBankingCustomer = {
	name: "Personal Banking Customer",
};

export const CustomerServiceStaff = {
	name: "CustomerServiceStaff",
};

export const BackOfficeStaff = {
	name: "Back Office Staff",
};

export const ATM = {
	name: "ATM",
};

export const InternetBankingSystem = {
	name: "Internet Banking System",
};

export const MainframeBankingSystem = {
	name: "Mainframe Banking System",
};

export const EmailSystem = {
	name: "E-mail System",
};

export const WebApplication = {
	name: "Web Application",
};

export const MobileApp = {
	name: "Mobile App",
};

export const SinglePageApplication = {
	name: "Single-Page Application",
};

export const APIApplication = {
	name: "API Application",
};

export const Database = {
	name: "Database",
};

export const SignInController = {
	name: "Sign In Controller",
};

export const ResetPasswordController = {
	name: "Reset Password Controller",
};

export const AccountsSummaryController = {
	name: "Accounts Summary Controller",
};

export const SecurityComponent = {
	name: "Security Component",
};

export const EmailComponent = {
	name: "E-mail Component",
};

export const MainframeBankingSystemFacade = {
	name: "Mainframe Banking System Facade",
};

export const entityRelationshipModel = [
	BigBankPlc,
	[
		"<Software system of",
		[
			PersonalBankingCustomer,
			["Asks questions to>", CustomerServiceStaff],
			["Withdraws cash using>", ATM],
			["Views account balances, and makes payments using>", InternetBankingSystem],
		],
		[
			[CustomerServiceStaff, BackOfficeStaff, ATM],
			["Uses>", MainframeBankingSystem],
		],

		[
			InternetBankingSystem,
			["Gets account information from, and makes payments using>", MainframeBankingSystem],
			["Sends e-mail using>", EmailSystem],
			[
				"<Container of",
				[
					WebApplication,
					["Delivers to the customer's web browser>", SinglePageApplication],
					["<Visits bigbank.com/ib using [HTTPS]", PersonalBankingCustomer],
				],
				[
					[SinglePageApplication, MobileApp],
					["Makes API calls to [JSON/HTTPS]>", APIApplication],
					["<Views account balances, and makes payments using", PersonalBankingCustomer],
				],

				Database,

				[
					APIApplication,
					["Sends e-mail using>", EmailSystem],
					["Makes API calls to [XML/HTTPS]>", MainframeBankingSystem],
					["Reads from and writes to [SQL/TCP]>", Database],
					[
						"<Component of",
						[
							SignInController,
							["<Makes API calls to [JSON/HTTPS]", SinglePageApplication, MobileApp],
							["Uses>", SecurityComponent],
						],
						[
							ResetPasswordController,
							["<Makes API calls to [JSON/HTTPS]", SinglePageApplication, MobileApp],
							["Uses>", EmailComponent],
						],
						[
							AccountsSummaryController,
							["<Makes API calls to [JSON/HTTPS]", SinglePageApplication, MobileApp],
							["Uses>", MainframeBankingSystemFacade],
						],
						[SecurityComponent, ["Reads from and writes to [SQL/TCP]>", Database]],
						[EmailComponent, ["Sends e-mail using>", EmailSystem]],
						[MainframeBankingSystemFacade, ["Makes API calls to [XML/HTTPS]>", MainframeBankingSystem]],
					],
				],
			],
		],

		MainframeBankingSystem,

		[EmailSystem, ["Sends emails to>", PersonalBankingCustomer]],
	],
] as const satisfies ERM;

export const triplets = parseEntityRelationshipTriplets(entityRelationshipModel);

export const [[softwareSystems]] = edgesOfName("Software system of", triplets);
export const InternetBankingSystemContextEdges = edgesOfNode(
	["Container of", "Software system of"],
	InternetBankingSystem,
	triplets,
);

export const toNodesAndEdges = (
	res: { nodes: Omit<Node, "position">[]; edges: any[] },
	// res: { nodes: Omit<Node, "position">[]; edges: Edge[] },
	[sources, edges, targets]: EntityRelationshipTriplet,
) => {
	const parsedNodes = [sources, targets]
		.map(oneOrMany)
		.map((models) =>
			models.map((model) => ({
				id: model.name,
				type: "editableLabel",
				data: {
					label: model.name,
				},
			})),
		)
		.flat() as Omit<any, "position">[];
	// .flat() as Omit<Node, "position">[];

	const parsedEdges = oneOrMany(edges)
		.map((edge) =>
			oneOrMany(sources).map((s) =>
				oneOrMany(targets).map((t) => ({
					id: `${s.name}->${edge}->${t.name}`,
					source: s.name,
					target: t.name,
					label: edge,
					type: "smoothstep",
				})),
			),
		)
		.flat(2) as any[];
	// .flat(2) as Edge[];

	return {
		nodes: [...res.nodes, ...parsedNodes],
		edges: [...res.edges, ...parsedEdges],
	};
};

// todo: containers of InternetBankingSystem specifically
//       and include links to software systems
export const [[containers]] = edgesOfName("Container of", triplets);
export const InternetBankingSystemContainerEdges = edgesOfNodes(
	["Component of", "Container of"],
	[
		...InternetBankingSystemContextEdges.reduce(toNodesAndEdges, {
			nodes: [],
			edges: [],
		}).nodes.map((node) => ({
			name: node.data.label,
		})),
		...oneOrMany(containers),
	],
	triplets,
);

export const [[components]] = edgesOfName("Component of", triplets);
export const APIApplicationContainerEdges = edgesOfNodes(["Code of", "Component of"], oneOrMany(components), triplets);
