import { getCollection, type CollectionEntry } from 'astro:content';
export const url = (path = '') => import.meta.env.BASE_URL.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
export const lessonUrl = (id: string) => url('concepts/' + id + '/');
export async function catalog() {
  const categories = (await getCollection('categories')).sort((a,b) => a.data.order-b.data.order);
  const concepts = (await getCollection('concepts', e => !e.data.draft)).sort((a,b) => a.data.order-b.data.order || a.id.localeCompare(b.id));
  const ids = new Set(concepts.map(x=>x.id));
  for (const e of concepts) {
    if (!categories.some(c=>c.id===e.data.category.id)) throw new Error('Unknown category: '+e.id);
    for (const ref of [...e.data.prerequisites,...e.data.related]) {
      if (!ids.has(ref.id)) throw new Error('Unavailable lesson reference: '+e.id+' -> '+ref.id);
    }
  }
  return { categories, concepts };
}
export type Lesson = CollectionEntry<'concepts'>;
