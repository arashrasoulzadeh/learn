import type {DeepLesson} from './types';
import {network} from './network';
import {backend} from './backend';
import {data} from './data';
export const deepLessons:Record<string,DeepLesson>=Object.fromEntries([...network,...backend,...data].map(l=>[l.slug,l]));
