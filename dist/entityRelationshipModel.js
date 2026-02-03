"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.edgesOfNodes = exports.edgesOfNode = exports.edgesOfName = exports.parseEntityRelationshipTriplets = void 0;
const arrayable_1 = require("./arrayable");
const typeFieldName = "name";
// TODO: accept a triplet fn, or automatically define on models
//		 or fn that lets you describe a shape
const parseEntityRelationshipTriplets = (erm) => {
    const oneOrManyEntitySubentityPairs = isEntityModels(erm[0])
        ? [erm]
        : erm;
    return oneOrManyEntitySubentityPairs.flatMap(([entities, ...relationshipSubentityPairs]) => relationshipSubentityPairs.reduce((entityRelationshipTriplets, [relationships, ...tbds]) => {
        const [subentities, subpairs] = tbds.reduce(parseTBDs, [[], []]);
        const [upstreamRelationshipNames, downstreamRelationshipNames] = (0, arrayable_1.arrayable)(relationships).reduce(parseRelationships, [[], []]);
        // Reverse the entity/subentity order for upstream
        const upstreamEntityRelationship = [
            (0, arrayable_1.unwrapArrayable)(subentities),
            (0, arrayable_1.unwrapArrayable)(upstreamRelationshipNames.map((name) => name.slice(1))),
            entities,
        ];
        // Retain the normal order for downstream
        const downstreamEntityRelationship = [
            entities,
            (0, arrayable_1.unwrapArrayable)(downstreamRelationshipNames.map((name) => name.slice(0, -1))),
            (0, arrayable_1.unwrapArrayable)(subentities),
        ];
        // @ts-ignore
        return [
            ...entityRelationshipTriplets,
            ...(upstreamRelationshipNames.length ? [upstreamEntityRelationship] : []),
            ...(downstreamRelationshipNames.length ? [downstreamEntityRelationship] : []),
            ...subpairs.flatMap((subERM) => (0, exports.parseEntityRelationshipTriplets)(subERM)),
        ];
    }, []));
};
exports.parseEntityRelationshipTriplets = parseEntityRelationshipTriplets;
/**
 * Is the candidate one or many EntityModel(s) or EntitySubentityPair(s)?
 *
 * This gets a little tricky because the candidate can be one or many object(s) (Entity) or tuple(s) (EntitySubentityPair)
 */
const isEntityModels = (candidate) => {
    // We encounter one EntityModel
    if (typeFieldName in candidate) {
        return true;
    }
    // We encounter many EntityModels
    if (Array.isArray(candidate) &&
        (candidate.length === 1 ||
            // one EntitySubentityPair would have an array in the second position
            !Array.isArray(candidate[1]))) {
        return true;
    }
};
/**
 * Organize a TBD into either entities or subpairs
 */
const parseTBDs = ([entities, subpairs], tbd) => isEntityModels(tbd)
    ? // We encounter an Entity
        (() => {
            const entity = tbd;
            return [[...entities, entity], subpairs];
        })()
    : // We encounter a Subpair
        (() => {
            const subpair = tbd;
            const [subentities] = subpair;
            return [
                [...entities, ...(0, arrayable_1.arrayable)(subentities)],
                [...subpairs, subpair],
            ];
        })();
const parseRelationships = ([upstream, downstream], relationship) => 
// prettier-ignore
relationship.startsWith("<") && [[...upstream, relationship], downstream] ||
    relationship.endsWith(">") && [upstream, [...downstream, relationship]] ||
    [upstream, downstream];
const edgesOfName = (name, triplets) => triplets.reduce((res, [sources, edges, targets]) => {
    const matchingEdge = (0, arrayable_1.arrayable)(edges).find((edge) => edge === name);
    if (matchingEdge) {
        const triplet = [sources, matchingEdge, targets];
        return [...res, triplet];
    }
    return res;
}, []);
exports.edgesOfName = edgesOfName;
const edgesOfNode = (namesToIgnore, node, triplets) => {
    return triplets.reduce((res, [sources, edges, targets]) => {
        const [sourceMatches, targetMatches] = [sources, targets]
            .map(arrayable_1.arrayable)
            .map((models) => models.filter((model) => model === node));
        if ((sourceMatches.length || targetMatches.length) &&
            !(0, arrayable_1.arrayable)(edges).some((edge) => namesToIgnore.some((name) => name === edge))) {
            return [
                ...res,
                [
                    sourceMatches.length ? (0, arrayable_1.unwrapArrayable)(sourceMatches) : sources,
                    edges,
                    targetMatches.length ? (0, arrayable_1.unwrapArrayable)(targetMatches) : targets,
                ],
            ];
        }
        return res;
    }, []);
};
exports.edgesOfNode = edgesOfNode;
const edgesOfNodes = (namesToIgnore, nodes, triplets) => {
    return triplets.reduce((res, [source, edge, target]) => {
        const [sourceMatches, targetMatches] = [source, target]
            .map(arrayable_1.arrayable)
            .map((models) => models.filter((model) => nodes.some((node) => node.name === model.name)));
        if (sourceMatches.length &&
            targetMatches.length &&
            !(0, arrayable_1.arrayable)(edge).some((edge) => namesToIgnore.some((name) => name === edge))) {
            return [
                ...res,
                [
                    sourceMatches.length ? (0, arrayable_1.unwrapArrayable)(sourceMatches) : source,
                    edge,
                    targetMatches.length ? (0, arrayable_1.unwrapArrayable)(targetMatches) : target,
                ],
            ];
        }
        return res;
    }, []);
};
exports.edgesOfNodes = edgesOfNodes;
