const express = require('express');
const TofuOrder = require('../models/tofuorder');
const auth = require('../auth');

const router = express.Router();

// 定義品項價格（與前端一致）
const PRODUCTS = {
  momen_tofu: { name: '板豆腐', price: 30 },
  fried_tofu: { name: '油豆腐', price: 10 },
  soft_tofu: { name: '嫩豆腐', price: 30 }
};

// POST /api/orders - 建立新訂單
router.post('/order', async (req, res) => {
    try {
        const { customerName, phone, address, deliveryTime } = req.body;

        // 1. 過勞檢查：檢查同一個 deliveryTime 是否已有 5 張單
        const orderCount = await TofuOrder.countDocuments({ deliveryTime });
        if (orderCount >= 2) {
            return res.status(400).send(`
                <script>
                    alert('這個時段拓海送不完了，請選別的時間！');
                    window.history.back();
                </script>
            `);
        };

        // 2. 處理商品與計算金額
        let itemsToSave = [];
        let totalAmount = 0;

        // 遍歷我們定義的產品清單，看 req.body 裡面有沒有對應的數量
        for (const key in PRODUCTS) {
            const qty = parseInt(req.body[key]) || 0;
            if (qty > 0) {
                const itemTotal = PRODUCTS[key].price * qty;
                totalAmount += itemTotal;
                itemsToSave.push({
                    name: PRODUCTS[key].name,
                    qty: qty,
                    price: PRODUCTS[key].price
                });
            }
        };

        // 3. 預防空單
        if (itemsToSave.length === 0) {
            return res.status(400).send("文太：至少要買一塊豆腐吧！");
        };

        // 4. 存入資料庫
        const newOrder = new TofuOrder({
            customerName,
            phone,
            address,
            deliveryTime,
            items: itemsToSave,
            totalAmount
        });

        await newOrder.save();

        // 5. 成功後導向成功頁面或首頁
        res.send(`
            <script>
                alert('訂單已收到！拓海大約 ${deliveryTime} 會送到秋名山。');
                window.location.href = '/'; 
            </script>
        `);

    } catch (err) {
        console.error(err);
        res.status(500).send("系統出錯了，請檢查後台");
    };
});

module.exports = router;