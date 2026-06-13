const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { option, x, y, color } = req.body; 

  const prices = {
    black:  50,   // 0,50€ en centimes
    color:  100,  // 1,00€
    pack5:  400,  // 4,00€
    pack10: 700,  // 7,00€
  };

  const labels = {
    black:  'Pixel noir OnePixel',
    color:  'Pixel coloré OnePixel',
    pack5:  'Pack 5 pixels OnePixel',
    pack10: 'Pack 10 pixels OnePixel',
  };

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: labels[option] },
          unit_amount: prices[option],
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `https://one-pixel-one.vercel.app?success=true&x=${x}&y=${y}&color=${encodeURIComponent(color)}&option=${option}`,
      cancel_url: `https://one-pixel-one.vercel.app?canceled=true`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}