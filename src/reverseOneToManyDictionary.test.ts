import { describe, expect, it } from "vitest";
import { reverseOneToManyDictionary } from "./reverseOneToManyDictionary";

describe("reverseOneToManyDictionary", () => {
	const input = {
		LABEL_CREATED: ["PU", "PX", "OC"],
		OUT_FOR_DELIVERY: ["OD"],
	} as const;

	const output = reverseOneToManyDictionary(input);

	it("reverses a one to many dictionary to a many to one dictionary", () => {
		expect(output).toEqual({
			PU: "LABEL_CREATED",
			PX: "LABEL_CREATED",
			OC: "LABEL_CREATED",
			OD: "OUT_FOR_DELIVERY",
		});
	});
});
