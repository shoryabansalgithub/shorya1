import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ForecastEngine {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Applies a Simple Moving Average (SMA) over the last N periods to predict the next period.
   * In the future, this Strategy pattern will route to ML python services.
   */
  calculateSMA(data: number[], period: number): number {
    if (data.length < period) return 0;
    const slice = data.slice(-period);
    const sum = slice.reduce((a, b) => a + b, 0);
    return Number((sum / period).toFixed(2));
  }

  async generateNextDayRevenueForecast(shopId: string) {
    // Fetch last 7 days of revenue
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setUTCHours(0,0,0,0);
    endDate.setUTCHours(0,0,0,0);

    const aggregations = await this.prisma.dailySalesAggregation.findMany({
      where: { shopId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' }
    });

    const revenueData = aggregations.map(a => a.netRevenue.toNumber());
    
    // SMA-3 (Simple Moving Average 3-day)
    return {
      sma3Forecast: this.calculateSMA(revenueData, 3),
      sma7Forecast: this.calculateSMA(revenueData, 7),
      confidenceScore: 0.65 // Baseline algorithmic confidence
    };
  }
}
