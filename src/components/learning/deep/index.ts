import type {DeepLesson} from './types';
import {network} from './network';
import {backend} from './backend';
import {data} from './data';
import {advancedTraces} from '../advanced/index';
export const deepLessons:Record<string,DeepLesson>=Object.fromEntries([...network,...backend,...data,...advancedTraces].map(l=>[l.slug,l]));
