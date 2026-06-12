# 🚀 Guide — Mettre OnePixel en ligne

## Ce dont tu auras besoin
- Un compte Supabase (gratuit) → supabase.com
- Un compte Vercel (gratuit) → vercel.com
- Un compte Stripe → stripe.com
- GitHub (gratuit) → github.com

---

## ÉTAPE 1 — Supabase (base de données)

1. Va sur **supabase.com** → "Start your project" → crée un compte
2. Clique "New project", donne un nom (ex: "onepixel"), choisis une région (Europe West)
3. Une fois créé, va dans **SQL Editor** (menu gauche)
4. Colle tout le contenu de `supabase_setup.sql` et clique "Run"
5. Va dans **Settings > API** et copie :
   - `Project URL` → c'est ton SUPABASE_URL
   - `anon public` key → c'est ton SUPABASE_KEY
6. Dans `public/app.js`, remplace :
   - `REMPLACE_PAR_TON_URL_SUPABASE` par ton Project URL
   - `REMPLACE_PAR_TA_CLE_SUPABASE` par ta clé anon

---

## ÉTAPE 2 — Stripe (paiements)

1. Va sur **stripe.com** → crée un compte, vérifie ton email
2. Dans le dashboard, va dans **Developers > API keys**
3. Copie la **Publishable key** (commence par `pk_live_...`)
4. Dans `public/app.js`, remplace `REMPLACE_PAR_TA_CLE_STRIPE_PUBLIQUE`
5. Crée deux produits dans Stripe :
   - "Pixel noir" → prix 0,50€ unique
   - "Pixel coloré" → prix 1,00€ unique
6. Note les **Price IDs** (commencent par `price_...`)

---

## ÉTAPE 3 — GitHub (mettre les fichiers en ligne)

1. Va sur **github.com** → crée un compte
2. Clique "New repository", appelle-le "onepixel", laisse Public
3. Sur ton ordinateur, télécharge l'application **GitHub Desktop** (desktop.github.com)
4. Clone ton repo, copie tous les fichiers du dossier `public/` dedans
5. Dans GitHub Desktop, écris un message ("premier commit") et clique "Commit" puis "Push"

---

## ÉTAPE 4 — Vercel (mise en ligne)

1. Va sur **vercel.com** → "Sign up with GitHub"
2. Clique "New Project" → sélectionne ton repo "onepixel"
3. Vercel détecte automatiquement, clique "Deploy"
4. En 30 secondes, ton site est en ligne avec une URL du type `onepixel.vercel.app` !

---

## ÉTAPE 5 — Nom de domaine (optionnel mais recommandé)

1. Va sur **namecheap.com** ou **ovhcloud.com**
2. Cherche `onepixel.io` ou `onepixel.me` (~10-15€/an)
3. Dans Vercel > Settings > Domains, ajoute ton domaine
4. Suis les instructions DNS (5 min)

---

## Récapitulatif des coûts

| Service | Coût |
|---------|------|
| Supabase | Gratuit jusqu'à 500MB |
| Vercel | Gratuit |
| GitHub | Gratuit |
| Stripe | 1,5% + 0,25€ par transaction |
| Nom de domaine | ~10€/an (optionnel) |

**Exemple : si tu vends 100 pixels à 0,50€ = 50€**
Stripe prend environ 1€ → tu gardes ~49€

---

## Support

Si tu bloques sur une étape, dis-le moi et je t'aide !
