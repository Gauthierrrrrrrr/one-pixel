export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { option, x, y, color } = req.body;

  const prices = {
    black:  50,
    color:  100,
    pack5:  400,
    pack10: 700,
  };

  const labels = {
    black:  'Pixel noir OnePixel',
    color:  'Pixel coloré OnePixel',
    pack5:  'Pack 5 pixels OnePixel',
    pack10: 'Pack 10 pixels OnePixel',
  };

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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