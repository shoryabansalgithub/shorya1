export interface ConfigDomainMetadata {
  owner: string;
  feature: string;
  version: string;
  description: string;
}

export interface ConfigDomainRecord {
  name: string;
  metadata: ConfigDomainMetadata;
  variables: string[];
  injectedBy: string[]; // Services/Providers that inject this domain
  validatedBy: string[]; // Rules that depend on this domain
}

export interface ValidationRuleRecord {
  name: string;
  dependencies: string[]; // Config domains required by this rule
}

export interface ConfigurationRegistryData {
  domains: Map<string, ConfigDomainRecord>;
  rules: Map<string, ValidationRuleRecord>;
  variableOwnership: Map<string, string>; // Maps variable name (e.g. 'REDIS_URL') to domain name (e.g. 'RedisConfig')
}
