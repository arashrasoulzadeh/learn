import type {NetworkLesson} from '../network/types';
import type {FieldExercise} from '../network/fieldExercises';
export type BackendLesson=NetworkLesson&{field:FieldExercise;model:'execution'|'memory'|'queue'|'pipeline'|'resource'|'identity';};
