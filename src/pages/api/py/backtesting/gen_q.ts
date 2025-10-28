import { NextApiRequest, NextApiResponse } from 'next';

interface PriceData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface Question {
    symbol: string;
    previous_prices: PriceData[];
    after_prices: PriceData[];
    previous_indicates: Record<string, any>;
    correct_ans: "buy" | "sell";
    explanations: string[];
    profitLoss?: number;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Question[] | { error: string }>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 從環境變量獲取資料庫配置
        const server = process.env.DB_SERVER || 'localhost';
        const database = process.env.DB_DATABASE || 'market_stock_tw';
        const table = 'stock_data_1d';
        const user = process.env.DB_WEBUSER || 'webuser';
        const password = process.env.DB_WEBUSER_PASSWORD || '';

        // 調用 Python 後端 API 5 次來獲取 5 個問題
        const pythonApiUrl = process.env.PY_API_HOST;
        const questions: Question[] = [];
        
        for (let i = 0; i < 5; i++) {
            const response = await fetch(`${pythonApiUrl}/backtesting/gen_q`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    server,
                    database,
                    table,
                    user,
                    password
                })
            });

            if (!response.ok) {
                throw new Error(`Python API error: ${response.status}`);
            }

            const question: Question = await response.json();
            
            // 為前端添加隨機的 profitLoss
            const baseProfit = Math.floor(Math.random() * 200) + 50;
            question.profitLoss = question.correct_ans === 'buy' ? baseProfit : -baseProfit;
            
            questions.push(question);
            
            // 添加小延遲避免過於頻繁的 API 調用
            if (i < 4) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
        
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to generate questions. Please try again.' 
        });
    }
}