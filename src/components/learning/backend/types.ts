import type {NetworkLesson,Scenario,Actor} from '../network/types';
import type {FieldExercise} from '../network/fieldExercises';
export type BackendScenario=Scenario&{prediction:string;actors?:Actor[];edges?:[number,number][];};
export type BackendLesson=Omit<NetworkLesson,'scenarios'>&{scenarios:BackendScenario[];field:FieldExercise;model:'execution'|'memory'|'queue'|'pipeline'|'resource'|'identity'|'database'|'architecture'|'distributed';};
