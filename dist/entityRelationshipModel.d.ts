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
import { OneOrMany, ReadonlyOneOrMany as OneOrManyReadonly } from "./arrayable";
declare const typeFieldName = "name";
export type Model = {
    [typeFieldName]: string;
};
export type EntityModel = Model & {};
export type RelationshipModel = Model & {};
type EntitySubentityPair<RelationshipNames extends string = string, Entity extends Record<typeof typeFieldName, string> = EntityModel> = readonly [OneOrMany<Entity>, ...RelationshipSubentityPair<RelationshipNames, Entity>[]];
type RelationshipSubentityPair<RelationshipNames extends string = string, Entity extends Record<typeof typeFieldName, string> = EntityModel> = readonly [
    OneOrManyReadonly<UpstreamRelationshipName<RelationshipNames> | DownstreamRelationshipName<RelationshipNames>>,
    ...(EntitySubentityPair<RelationshipNames> | Entity)[]
];
type UpstreamRelationshipName<RelationshipNames extends string = string> = `<${RelationshipNames}`;
type DownstreamRelationshipName<RelationshipNames extends string = string> = `${RelationshipNames}>`;
export type EntityRelationshipTriplet<SourceNode = EntityModel, Edge = RelationshipModel | string, TargetNode = EntityModel> = OneSourceToOneOrManyTargets<SourceNode, Edge, TargetNode> | OneOrManySourcesToOneTarget<SourceNode, Edge, TargetNode>;
type OneSourceToOneOrManyTargets<SourceNode = EntityModel, Edge = RelationshipModel | string, TargetNode = EntityModel> = readonly [SourceNode, OneOrMany<Edge>, OneOrMany<TargetNode>];
type OneOrManySourcesToOneTarget<SourceNode = EntityModel, Edge = RelationshipModel | string, TargetNode = EntityModel> = readonly [OneOrMany<SourceNode>, OneOrMany<Edge>, TargetNode];
export declare const parseEntityRelationshipTriplets: (erm: ERM) => Array<EntityRelationshipTriplet>;
export declare const edgesOfName: (name: string, triplets: EntityRelationshipTriplet[]) => EntityRelationshipTriplet<Model, string | Model, Model>[];
export declare const edgesOfNode: (namesToIgnore: string[], node: EntityModel, triplets: EntityRelationshipTriplet[]) => EntityRelationshipTriplet<Model, string | Model, Model>[];
export declare const edgesOfNodes: (namesToIgnore: string[], nodes: EntityModel[], triplets: EntityRelationshipTriplet[]) => EntityRelationshipTriplet<Model, string | Model, Model>[];
export {};
