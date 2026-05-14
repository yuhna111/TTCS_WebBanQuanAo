const pool = require('./backend/config/db');
(async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM `order` WHERE order_id = ? LIMIT 1', [15]);
    console.log('ORDER:', rows[0]);
    const [items] = await pool.query('SELECT od.*, p.product_name, p.image_url FROM order_detail od JOIN Product p ON od.product_id = p.product_id WHERE od.order_id = ?', [15]);
    console.log('ITEMS:', items);
    const [payments] = await pool.query('SELECT * FROM Payment WHERE order_id = ?', [15]);
    console.log('PAYMENT:', payments);
  } catch (e) {
    console.error('ERR', e.message);
  } finally {
    process.exit();
  }
})();
