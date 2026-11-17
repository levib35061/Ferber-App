/** The website's tools must use the same charts as the app. */
import { readFileSync } from 'fs';
import { join } from 'path';

import { FERBER_DEFAULT_CHART, gentleChart } from '../ferber';

const site = (file: string) => readFileSync(join(__dirname, '../../../site', file), 'utf8');

describe.each(['timer.html', 'chart.html'])('site/%s', (file) => {
  it('embeds the same charts as the app', () => {
    const match = site(file).match(/const CHARTS = (\{.*?\});/);
    expect(match).not.toBeNull();
    const charts = JSON.parse(match![1]);
    expect(charts.standard).toEqual(FERBER_DEFAULT_CHART);
    expect(charts.gentle).toEqual(gentleChart());
  });
});

describe('site/index.html', () => {
  it('shows the app chart in its table', () => {
    const html = site('index.html');
    for (const row of FERBER_DEFAULT_CHART) {
      expect(html).toContain(row.map((m) => `<td class="num">${m}</td>`).join(''));
    }
  });
});
