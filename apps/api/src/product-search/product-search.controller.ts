import { Controller, Post, Get, Body, Param, UseGuards, Req, Query, BadRequestException } from '@nestjs/common';
import { SearchEngineService } from './search-engine.service';
import { SynonymEngineService } from './synonym-engine.service';
import { SearchAnalyticsService } from './search-analytics.service';
import { IndexingEngineService } from './indexing-engine.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../iam/guards/tenant.guard';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('search')
export class ProductSearchController {
  constructor(
    private readonly searchEngine: SearchEngineService,
    private readonly synonymEngine: SynonymEngineService,
    private readonly searchAnalytics: SearchAnalyticsService,
    private readonly indexEngine: IndexingEngineService,
  ) {}

  @Get()
  async search(
    @Query('q') query: string,
    @Query('sort') sort: string,
    @Query('limit') limitStr: string,
    @Req() req: any
  ) {
    if (!query) throw new BadRequestException('Query is required');
    const limit = limitStr ? parseInt(limitStr, 10) : 20;
    const start = Date.now();
    
    const expandedQuery = await this.synonymEngine.expandQuery(req.shop.id, query);
    const results = await this.searchEngine.search(req.shop.id, expandedQuery, undefined, sort, limit);
    
    // Log analytics async
    this.searchAnalytics.logSearch(
      req.shop.id, 
      req.user.id, 
      query, 
      results.length, 
      Date.now() - start
    ).catch(e => console.error(e));

    return results;
  }

  @Get('suggestions')
  async getSuggestions(@Query('q') query: string, @Req() req: any) {
    if (!query) return [];
    return this.searchEngine.autocomplete(req.shop.id, query);
  }

  @Get('popular')
  async getPopular(@Req() req: any) {
    return this.searchAnalytics.getPopularSearches(req.shop.id);
  }

  @Post('synonyms')
  async addSynonym(@Body() body: { term: string; synonyms: string }, @Req() req: any) {
    if (!body.term || !body.synonyms) throw new BadRequestException('Invalid payload');
    return this.synonymEngine.addSynonym(req.shop.id, body.term, body.synonyms);
  }

  @Post('reindex')
  async reindex(@Req() req: any) {
    await this.indexEngine.triggerFullReindex(req.shop.id);
    return { message: 'Full reindex triggered successfully' };
  }
}

