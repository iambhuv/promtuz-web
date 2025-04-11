import type { HandlerGroup } from '@/types/events';

export const relationHandlers: HandlerGroup = {
  RELATIONSHIP_CREATE: (get, set, relation) => {
    if (!get().users.get(relation.user_id)) get().loadUser(relation.user_id)

    set(({ relationships }) => ({
      relationships: new Map(relationships).set(relation.id, relation)
    }))
  },
  RELATIONSHIP_DELETE: (get, set, relation) => {
    set(({ relationships }) => {
      const updated_relations = new Map(relationships);
      updated_relations.delete(relation.id);

      return ({
        relationships: updated_relations
      })
    })
  },
  RELATIONSHIP_UPDATE: (get, set, relation) => {
    set(({ relationships }) => {
      const updated_relations = new Map(relationships);
      const current_relationship = updated_relations.get(relation.id);

      if (!current_relationship) return {};

      updated_relations.set(relation.id, { ...current_relationship, ...relation });

      return ({
        relationships: updated_relations
      })
    })
  },
} as const;