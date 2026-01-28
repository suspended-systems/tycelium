/**
 * An array-based implementation for representing an Entity–Relationship Model.
 * Each level is prefixed or suffixed with a glyph (< or >), representing the node edge node order.
 * Either sourceNode downstreamEdge> targetNode or targetNode <upstreamEdge sourceNode.
 *
 * There is no concept of hasOne or hasMany. However, one way this can be achieved is by implying this information by whether an EntityModel, when being processed as an actual record, is a singular record or an array of records. An implementation for keying the array items would be necessary as well.
 *
 * This data structure is useful for describing upstream/downstream relationships while still retaining hierarchical order.
 *
 * It doesn't read very well with code formatters like prettier, so ***it's recommended to pair usage with `// prettier-ignore`***.
 */
export type ERM<RelationshipNames extends string = string> = OneOrMany<EntitySubentityPair<RelationshipNames>>;

import {
	OneOrMany,
	ReadonlyOneOrMany as OneOrManyReadonly,
	Many,
	arrayable as oneOrMany,
	unwrapArrayable as toOneOrMany,
} from "./arrayable";

const typeFieldName = "name";
export type Model = { [typeFieldName]: string };
export type EntityModel = Model & {};
export type RelationshipModel = Model & {};

type EntitySubentityPair<
	RelationshipNames extends string = string,
	Entity extends Record<typeof typeFieldName, string> = EntityModel,
> = readonly [OneOrMany<Entity>, ...RelationshipSubentityPair<RelationshipNames, Entity>[]];

type RelationshipSubentityPair<
	// todo: support RelationshipModel instead of RelationshipName, make name camelCased with glypth whereas entities PascalCased no glyph
	RelationshipNames extends string = string,
	Entity extends Record<typeof typeFieldName, string> = EntityModel,
> = readonly [
	OneOrManyReadonly<UpstreamRelationshipName<RelationshipNames> | DownstreamRelationshipName<RelationshipNames>>,
	...(EntitySubentityPair<RelationshipNames> | Entity)[],
];

type UpstreamRelationshipName<RelationshipNames extends string = string> = `<${RelationshipNames}`;
type DownstreamRelationshipName<RelationshipNames extends string = string> = `${RelationshipNames}>`;

export type EntityRelationshipTriplet<
	SourceNode = EntityModel,
	Edge = RelationshipModel | string,
	TargetNode = EntityModel,
> =
	| OneSourceToOneOrManyTargets<SourceNode, Edge, TargetNode>
	| OneOrManySourcesToOneTarget<SourceNode, Edge, TargetNode>;

type OneSourceToOneOrManyTargets<
	SourceNode = EntityModel,
	Edge = RelationshipModel | string,
	TargetNode = EntityModel,
> = readonly [SourceNode, OneOrMany<Edge>, OneOrMany<TargetNode>];

type OneOrManySourcesToOneTarget<
	SourceNode = EntityModel,
	Edge = RelationshipModel | string,
	TargetNode = EntityModel,
> = readonly [OneOrMany<SourceNode>, OneOrMany<Edge>, TargetNode];

// TODO: accept a triplet fn, or automatically define on models
//		 or fn that lets you describe a shape
export const parseEntityRelationshipTriplets = (erm: ERM): Array<EntityRelationshipTriplet> => {
	const oneOrManyEntitySubentityPairs = isEntityModels(erm[0])
		? [erm as EntitySubentityPair]
		: (erm as Many<EntitySubentityPair>);

	return oneOrManyEntitySubentityPairs.flatMap(([entities, ...relationshipSubentityPairs]) =>
		relationshipSubentityPairs.reduce(
			(entityRelationshipTriplets, [relationships, ...tbds]): Array<EntityRelationshipTriplet> => {
				const [subentities, subpairs] = tbds.reduce(parseTBDs, [[], []]);

				const [upstreamRelationshipNames, downstreamRelationshipNames] = oneOrMany(relationships).reduce(
					parseRelationships,
					[[], []],
				);

				// Reverse the entity/subentity order for upstream
				const upstreamEntityRelationship = [
					toOneOrMany(subentities),
					toOneOrMany(upstreamRelationshipNames.map((name) => name.slice(1))),
					entities,
				] as const;
				// Retain the normal order for downstream
				const downstreamEntityRelationship = [
					entities,
					toOneOrMany(downstreamRelationshipNames.map((name) => name.slice(0, -1))),
					toOneOrMany(subentities),
				] as const;

				// @ts-ignore
				return [
					...entityRelationshipTriplets,

					...(upstreamRelationshipNames.length ? [upstreamEntityRelationship] : []),
					...(downstreamRelationshipNames.length ? [downstreamEntityRelationship] : []),

					...subpairs.flatMap((subERM) => parseEntityRelationshipTriplets(subERM)),
				];
			},
			[] as Array<EntityRelationshipTriplet>,
		),
	);
};

/**
 * Is the candidate one or many EntityModel(s) or EntitySubentityPair(s)?
 *
 * This gets a little tricky because the candidate can be one or many object(s) (Entity) or tuple(s) (EntitySubentityPair)
 */
const isEntityModels = (candidate: OneOrMany<EntityModel | EntitySubentityPair<string, EntityModel>>) => {
	// We encounter one EntityModel
	if (typeFieldName in candidate) {
		return true;
	}

	// We encounter many EntityModels
	if (
		Array.isArray(candidate) &&
		(candidate.length === 1 ||
			// one EntitySubentityPair would have an array in the second position
			!Array.isArray(candidate[1]))
	) {
		return true;
	}
};

/**
 * Organize a TBD into either entities or subpairs
 */
const parseTBDs = (
	[entities, subpairs]: [Array<EntityModel>, Array<EntitySubentityPair>],
	tbd: EntityModel | EntitySubentityPair<string, EntityModel>,
): [Array<EntityModel>, Array<EntitySubentityPair>] =>
	isEntityModels(tbd)
		? // We encounter an Entity
		  (() => {
				const entity = tbd as EntityModel;

				return [[...entities, entity], subpairs];
		  })()
		: // We encounter a Subpair
		  (() => {
				const subpair = tbd as EntitySubentityPair;
				const [subentities] = subpair;

				return [
					[...entities, ...oneOrMany(subentities)],
					[...subpairs, subpair],
				];
		  })();

const parseRelationships = (
	[upstream, downstream]: [Array<UpstreamRelationshipName>, Array<DownstreamRelationshipName>],
	relationship: UpstreamRelationshipName | DownstreamRelationshipName,
): [Array<UpstreamRelationshipName>, Array<DownstreamRelationshipName>] =>
	// prettier-ignore
	relationship.startsWith("<") 	&& [[...upstream, relationship as UpstreamRelationshipName], downstream] 		||
	relationship.endsWith(	">") 	&& [upstream, [...downstream, relationship as DownstreamRelationshipName]] 	||
												[upstream, downstream];

export const edgesOfName = (name: string, triplets: EntityRelationshipTriplet[]) =>
	triplets.reduce((res, [sources, edges, targets]) => {
		const matchingEdge = oneOrMany(edges).find((edge) => edge === name);

		if (matchingEdge) {
			const triplet = [sources, matchingEdge, targets] as const;
			return [...res, triplet] as EntityRelationshipTriplet[];
		}

		return res;
	}, [] as EntityRelationshipTriplet[]);

export const edgesOfNode = (namesToIgnore: string[], node: EntityModel, triplets: EntityRelationshipTriplet[]) => {
	return triplets.reduce((res, [sources, edges, targets]) => {
		const [sourceMatches, targetMatches] = [sources, targets]
			.map(oneOrMany)
			.map((models) => models.filter((model) => model === node));

		if (
			(sourceMatches.length || targetMatches.length) &&
			!oneOrMany(edges).some((edge) => namesToIgnore.some((name) => name === edge))
		) {
			return [
				...res,
				[
					sourceMatches.length ? toOneOrMany(sourceMatches) : sources,
					edges,
					targetMatches.length ? toOneOrMany(targetMatches) : targets,
				],
			] as EntityRelationshipTriplet[];
		}

		return res;
	}, [] as EntityRelationshipTriplet[]);
};

export const edgesOfNodes = (namesToIgnore: string[], nodes: EntityModel[], triplets: EntityRelationshipTriplet[]) => {
	return triplets.reduce((res, [source, edge, target]) => {
		const [sourceMatches, targetMatches] = [source, target]
			.map(oneOrMany)
			.map((models) => models.filter((model) => nodes.some((node) => node.name === model.name)));

		if (
			sourceMatches.length &&
			targetMatches.length &&
			!oneOrMany(edge).some((edge) => namesToIgnore.some((name) => name === edge))
		) {
			return [
				...res,
				[
					sourceMatches.length ? toOneOrMany(sourceMatches) : source,
					edge,
					targetMatches.length ? toOneOrMany(targetMatches) : target,
				],
			] as EntityRelationshipTriplet[];
		}

		return res;
	}, [] as EntityRelationshipTriplet[]);
};
