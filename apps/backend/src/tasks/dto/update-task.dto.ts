import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';

// PartialType(CreateTaskDto) génère une nouvelle classe avec LES MÊMES
// champs que CreateTaskDto (title, description, completed), mais tous
// rendus optionnels — pas besoin de retaper les decorators @IsString()/
// @IsBoolean() à la main, PartialType les recopie tout seul et ajoute
// @IsOptional() partout. Logique pour un PATCH : on doit pouvoir envoyer
// n'importe quel sous-ensemble de champs (ici juste { completed: true }
// pour marquer une tâche terminée, mais { title: "..." } marcherait aussi
// si un jour on ajoute l'édition du titre).
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
