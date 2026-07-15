import { Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { ConfigurationRegistryService } from './configuration-registry.service';

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [ConfigurationRegistryService],
  exports: [ConfigurationRegistryService],
})
export class ConfigurationRegistryModule {}
