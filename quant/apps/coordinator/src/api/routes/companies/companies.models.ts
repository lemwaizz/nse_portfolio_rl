import Elysia from "elysia";
import { CreateCompanyCommandSchema } from "@coordinator/models/commands/companies/create_company_command";
import {
  AcknowledgeActionSchema,
  ResourceCreatedSchema,
} from "@coordinator/models/infrastructure/general_responses";
import {
  CompanyListResponseSchema,
  CompanySchema,
} from "@coordinator/models/resources";

export const companiesModels = new Elysia().model({
  CreateCompanyCommand: CreateCompanyCommandSchema,
  AcknowledgeResponse: AcknowledgeActionSchema,
  ResourceCreated: ResourceCreatedSchema,
  Company: CompanySchema,
  CompanyListResponse: CompanyListResponseSchema,
});
