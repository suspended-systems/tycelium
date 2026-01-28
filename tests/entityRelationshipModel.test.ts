import { describe, expect, it } from "vitest";
import {
	ERM,
	parseEntityRelationshipTriplets,
	edgesOfName,
	edgesOfNode,
	edgesOfNodes,
} from "../src/entityRelationshipModel";

// Minimal test fixtures
const A = { name: "A" };
const B = { name: "B" };
const C = { name: "C" };
const D = { name: "D" };

describe("parseEntityRelationshipTriplets", () => {
	describe("downstream relationships", () => {
		it("parses a simple downstream relationship", () => {
			const erm = [A, ["rel>", B]] as const satisfies ERM;
			const triplets = parseEntityRelationshipTriplets(erm);

			expect(triplets).toEqual([[A, "rel", B]]);
		});

		it("parses downstream with multiple targets", () => {
			const erm = [A, ["rel>", B, C]] as const satisfies ERM;
			const triplets = parseEntityRelationshipTriplets(erm);

			expect(triplets).toEqual([[A, "rel", [B, C]]]);
		});
	});

	describe("upstream relationships", () => {
		it("parses a simple upstream relationship (reverses order)", () => {
			const erm = [A, ["<rel", B]] as const satisfies ERM;
			const triplets = parseEntityRelationshipTriplets(erm);

			// Upstream: B is the source, A is the target
			expect(triplets).toEqual([[B, "rel", A]]);
		});

		it("parses upstream with multiple sources", () => {
			const erm = [A, ["<rel", B, C]] as const satisfies ERM;
			const triplets = parseEntityRelationshipTriplets(erm);

			expect(triplets).toEqual([[[B, C], "rel", A]]);
		});
	});

	describe("multiple entities", () => {
		it("parses multiple source entities", () => {
			const erm = [[A, B], ["rel>", C]] as const satisfies ERM;
			const triplets = parseEntityRelationshipTriplets(erm);

			expect(triplets).toEqual([[[A, B], "rel", C]]);
		});

		it("parses multiple source and target entities", () => {
			const erm = [[A, B], ["rel>", C, D]] as const satisfies ERM;
			const triplets = parseEntityRelationshipTriplets(erm);

			expect(triplets).toEqual([[[A, B], "rel", [C, D]]]);
		});
	});

	describe("nested hierarchies", () => {
		it("parses nested subpairs", () => {
			const erm = [
				A,
				["parent>", [B, ["child>", C]]],
			] as const satisfies ERM;
			const triplets = parseEntityRelationshipTriplets(erm);

			expect(triplets).toEqual([
				[A, "parent", B],
				[B, "child", C],
			]);
		});

		it("parses deeply nested subpairs", () => {
			const erm = [
				A,
				["level1>", [B, ["level2>", [C, ["level3>", D]]]]],
			] as const satisfies ERM;
			const triplets = parseEntityRelationshipTriplets(erm);

			expect(triplets).toEqual([
				[A, "level1", B],
				[B, "level2", C],
				[C, "level3", D],
			]);
		});
	});

	describe("mixed upstream and downstream", () => {
		it("parses both upstream and downstream in same relationship slot", () => {
			const erm = [A, [["<up", "down>"], B]] as const satisfies ERM;
			const triplets = parseEntityRelationshipTriplets(erm);

			expect(triplets).toEqual([
				[B, "up", A],
				[A, "down", B],
			]);
		});
	});

	describe("multiple relationship-subentity pairs", () => {
		it("parses multiple relationships from same entity", () => {
			const erm = [
				A,
				["rel1>", B],
				["rel2>", C],
			] as const satisfies ERM;
			const triplets = parseEntityRelationshipTriplets(erm);

			expect(triplets).toEqual([
				[A, "rel1", B],
				[A, "rel2", C],
			]);
		});
	});

	describe("multiple root entity-subentity pairs", () => {
		it("parses multiple root pairs", () => {
			const erm = [
				[A, ["rel1>", B]],
				[C, ["rel2>", D]],
			] as const satisfies ERM;
			const triplets = parseEntityRelationshipTriplets(erm);

			expect(triplets).toEqual([
				[A, "rel1", B],
				[C, "rel2", D],
			]);
		});
	});
});

describe("edgesOfName", () => {
	const triplets = parseEntityRelationshipTriplets([
		A,
		["alpha>", B],
		["beta>", C],
		["alpha>", D],
	] as const satisfies ERM);

	it("finds single matching edge", () => {
		const result = edgesOfName("beta", triplets);

		expect(result).toEqual([[A, "beta", C]]);
	});

	it("finds multiple matching edges", () => {
		const result = edgesOfName("alpha", triplets);

		expect(result).toEqual([
			[A, "alpha", B],
			[A, "alpha", D],
		]);
	});

	it("returns empty array when no match", () => {
		const result = edgesOfName("gamma", triplets);

		expect(result).toEqual([]);
	});
});

describe("edgesOfNode", () => {
	const triplets = parseEntityRelationshipTriplets([
		A,
		["rel1>", B],
		["rel2>", C],
	] as const satisfies ERM);

	it("finds edges where node is source", () => {
		const result = edgesOfNode([], A, triplets);

		expect(result).toEqual([
			[A, "rel1", B],
			[A, "rel2", C],
		]);
	});

	it("finds edges where node is target", () => {
		const result = edgesOfNode([], B, triplets);

		expect(result).toEqual([[A, "rel1", B]]);
	});

	it("filters out ignored edge names", () => {
		const result = edgesOfNode(["rel1"], A, triplets);

		expect(result).toEqual([[A, "rel2", C]]);
	});

	it("returns empty when node not found", () => {
		const result = edgesOfNode([], D, triplets);

		expect(result).toEqual([]);
	});
});

describe("edgesOfNodes", () => {
	const triplets = parseEntityRelationshipTriplets([
		A,
		["rel1>", B],
		["rel2>", C],
		["rel3>", D],
	] as const satisfies ERM);

	it("includes edges where both endpoints are in node list", () => {
		const result = edgesOfNodes([], [A, B, C], triplets);

		expect(result).toEqual([
			[A, "rel1", B],
			[A, "rel2", C],
		]);
	});

	it("excludes edges where only source is in list", () => {
		const result = edgesOfNodes([], [A], triplets);

		expect(result).toEqual([]);
	});

	it("excludes edges where only target is in list", () => {
		const result = edgesOfNodes([], [B, C, D], triplets);

		expect(result).toEqual([]);
	});

	it("filters out ignored edge names", () => {
		const result = edgesOfNodes(["rel1"], [A, B, C], triplets);

		expect(result).toEqual([[A, "rel2", C]]);
	});

	it("returns empty when no edges connect given nodes", () => {
		const result = edgesOfNodes([], [B, C], triplets);

		expect(result).toEqual([]);
	});
});
