const mongoose = require('mongoose');

const tofuorderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  
  // 核心商品陣列
  items: [{
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 } // 下單當下的單價
  }],
  
  totalAmount: { type: Number, required: true, min: 0 },

  deliveryTime: { 
    type: String, 
    required: true,
    description: "格式範例: 04:30"
  },

  status: {
    type: String,
    enum: ['準備中', '已出貨'], // 增加已送達跟取消會更完整
    default: '準備中'
  }
}, {
  timestamps: true // 自動幫你產生 createdAt, updatedAt
});

module.exports = mongoose.model('TofuOrder', tofuorderSchema);