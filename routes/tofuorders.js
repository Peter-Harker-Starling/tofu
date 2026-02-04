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

router.get('/order', async (req, res) => {
    const timeSlots = ['01:00', '02:00', '03:00', '04:00', '05:00'];
    let slotsWithStatus = [];

    for (const time of timeSlots) {
        const count = await TofuOrder.countDocuments({ deliveryTime: time });
        slotsWithStatus.push({ time, full: count >= 2 });
    };

    res.render('order', { slotsWithStatus });
});

router.post('/order', async (req, res) => {
    try {
        const customerName = String(req.body.customerName).substring(0, 20);
        const { phone, address, deliveryTime } = req.body;

        const validSlots = ['01:00', '02:00', '03:00', '04:00', '05:00'];
        if (!validSlots.includes(deliveryTime)) {
            return res.status(400).send("非法配送時間");
        }

        let itemsToSave = [];
        let totalAmount = 0;

        // 遍歷我們定義的產品清單，看 req.body 裡面有沒有對應的數量
        for (const key in PRODUCTS) {
            const qty = parseInt(req.body[key]) || 0;
            if (qty > 20) return res.status(400).send("拓海開的是 AE86，不是卡車，量太多了！");

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

        const orderCount = await TofuOrder.countDocuments({ deliveryTime });
        if (orderCount >= 2) return res.status(400).send("已額滿");

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

router.get('/select', async (req, res) => {
    const phone = req.query.phone;

    let orders = null;
    if (phone) {
        orders = await TofuOrder
          .find({ phone })
          .sort({ createdAt: -1 });
    };

    res.render('selectOrder', { orders });
});

router.get('/dashboard', auth, async (req, res) => {
    try {
        const orders = await TofuOrder.find().sort({ createdAt: -1 }); // 新的在前
        res.render('dashboard', { orders: orders });
    } catch (err) {
        res.status(500).send("系統出錯了，請檢查後台");
    };
});

router.patch('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  if (!['準備中', '已出貨'].includes(status)) {
    return res.status(400).json({ error: '無效的訂單狀態' });
  }

  const order = await TofuOrder.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!order) {
    return res.status(404).json({ error: '訂單不存在' });
  };

  res.redirect('/tofu/dashboard');
});

router.delete('/:id', auth, async (req, res) => {
  await TofuOrder.findByIdAndDelete(req.params.id);
  res.redirect('/tofu/dashboard');
});

module.exports = router;