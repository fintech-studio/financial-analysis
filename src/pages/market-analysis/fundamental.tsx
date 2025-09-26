//基本面分析頁面
import React, { useState, useEffect } from 'react';

type Fundamentals = {
	 ticker: string;
	 name: string;
	 sector: string;
	 price: number;
	 eps: number;
	 pe: number;
	 pb: number;
	 roe: number;
	 revenueHistory: { year: string; value: number }[];
	 note?: string;
};

export default function FundamentalPage(): React.ReactElement {
	const [ticker, setTicker] = useState('AAPL');
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<Fundamentals | null>(null);
	const [error, setError] = useState<string | null>(null);

	// 模擬 API 取得基本面資料
	const mockFetchFundamentals = (symbol: string): Promise<Fundamentals> =>
		new Promise((res) => {
			setTimeout(() => {
				res({
					ticker: symbol.toUpperCase(),
					name: symbol.toUpperCase() === 'AAPL' ? 'Apple Inc.' : `${symbol.toUpperCase()} Corp.`,
					sector: 'Technology',
					price: 173.5,
					eps: 5.24,
					pe: 33.1,
					pb: 30.2,
					roe: 27.4,
					revenueHistory: [
						{ year: '2024', value: 380000 },
						{ year: '2023', value: 365000 },
						{ year: '2022', value: 350000 },
						{ year: '2021', value: 274000 },
						{ year: '2020', value: 260000 },
					],
					note: '示範資料，請連接真實 API 取得即時數據。',
				});
			}, 600);
		});

	useEffect(() => {
		// 預設載入一次
		loadData(ticker);
	}, []);

	// loadData: convert to function declaration to avoid potential parsing/use-before-define issues
	async function loadData(symbol?: string): Promise<void> {
		setLoading(true);
		setError(null);
		try {
			const d = await mockFetchFundamentals(symbol ?? ticker);
			setData(d);
		} catch (err) {
			// use the caught error to avoid "defined but never used" lint error
			setError(err instanceof Error ? err.message : '載入失敗');
		} finally {
			setLoading(false);
		}
	}

	// 簡單 SVG 長條圖 — avoid inline generic React.FC<...> to prevent TSX parsing ambiguity
	type RevenueChartProps = { items: { year: string; value: number }[] };
	const RevenueChart = ({ items }: RevenueChartProps) => {
		const max = Math.max(...items.map((i) => i.value));
		const w = 360;
		const h = 120;
		const gap = 8;
		const barW = (w - gap * (items.length - 1)) / items.length;
		return (
			<svg width={w} height={h} style={{ background: '#fff' }}>
				{items.map((it, idx) => {
					const barH = (it.value / max) * (h - 20);
					const x = idx * (barW + gap);
					const y = h - barH;
					return (
						<g key={it.year}>
							<rect x={x} y={y} width={barW} height={barH} fill="#4f46e5" rx={4} />
							<text x={x + barW / 2} y={h - 2} fontSize={10} textAnchor="middle" fill="#111">
								{it.year}
							</text>
						</g>
					);
				})}
			</svg>
		);
	};

	return (
		<div style={{ padding: 20, fontFamily: 'Segoe UI, Roboto, Arial' }}>
			<h2>基本面分析</h2>

			<div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
				<input
					value={ticker}
					onChange={(e) => setTicker(e.target.value)}
					placeholder="輸入股票代碼，如 AAPL"
					style={{ padding: 8, minWidth: 160 }}
				/>
				<button onClick={() => loadData()} disabled={loading} style={{ padding: '8px 12px' }}>
					{loading ? '載入中...' : '載入'}
				</button>
				<button
					onClick={() => {
						setTicker('');
						setData(null);
					}}
					style={{ padding: '8px 12px' }}
				>
					清除
				</button>
			</div>

			{error && <div style={{ color: 'crimson' }}>{error}</div>}

			{!data && !loading && <div style={{ color: '#666' }}>請輸入代碼並按「載入」以查看基本面資料。</div>}

			{data && (
				<section style={{ border: '1px solid #eee', padding: 12, borderRadius: 6, maxWidth: 760 }}>
					<header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
						<div>
							<h3 style={{ margin: 0 }}>
								{data.ticker} — {data.name}
							</h3>
							<div style={{ color: '#666', fontSize: 13 }}>{data.sector}</div>
						</div>
						<div style={{ textAlign: 'right' }}>
							<div style={{ fontSize: 18, fontWeight: 600 }}>${data.price.toFixed(2)}</div>
							<div style={{ fontSize: 12, color: '#666' }}>即時價格（模擬）</div>
						</div>
					</header>

					<hr style={{ margin: '12px 0' }} />

					<div style={{ display: 'flex', gap: 24 }}>
						{/* 指標區 */}
						<div style={{ minWidth: 260 }}>
							<table style={{ width: '100%', borderCollapse: 'collapse' }}>
								<tbody>
									<tr>
										<td style={{ padding: '6px 4px', color: '#444' }}>EPS</td>
										<td style={{ padding: '6px 4px', textAlign: 'right' }}>{data.eps.toFixed(2)}</td>
									</tr>
									<tr>
										<td style={{ padding: '6px 4px', color: '#444' }}>P/E</td>
										<td style={{ padding: '6px 4px', textAlign: 'right' }}>{data.pe.toFixed(1)}</td>
									</tr>
									<tr>
										<td style={{ padding: '6px 4px', color: '#444' }}>P/B</td>
										<td style={{ padding: '6px 4px', textAlign: 'right' }}>{data.pb.toFixed(2)}</td>
									</tr>
									<tr>
										<td style={{ padding: '6px 4px', color: '#444' }}>ROE</td>
										<td style={{ padding: '6px 4px', textAlign: 'right' }}>{data.roe.toFixed(1)}%</td>
									</tr>
								</tbody>
							</table>
							{data.note && (
								<div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
									<span style={{ fontWeight: 600 }}>備註：</span>
									{data.note}
								</div>
							)}
						</div>

						{/* 營收圖 */}
						<div style={{ flex: 1 }}>
							<div style={{ fontSize: 13, color: '#444', marginBottom: 6 }}>歷年營收（千萬 美元）</div>
							<RevenueChart items={data.revenueHistory.map((r) => ({ year: r.year, value: r.value / 1000 }))} />
						</div>
					</div>

					<hr style={{ margin: '12px 0' }} />

					{/* 簡單結論 */}
					<div style={{ fontSize: 14 }}>
						<div style={{ fontWeight: 600 }}>簡短結論</div>
						<p style={{ margin: '6px 0', color: '#333' }}>
							基於模擬資料：本公司在過去數年保持穩定營收成長且 ROE 表現良好，但 P/E 與 P/B 稍高，投資人應注意估值風險並進一步查看現金流與負債結構。
						</p>
					</div>
				</section>
			)}
		</div>
	);
}