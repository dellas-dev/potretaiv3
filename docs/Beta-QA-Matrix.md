# Beta QA Matrix

## Goal

Verify PotretAI v3 is ready for limited beta across the three active generators:

- Studio Foto AI
- Wisuda AI
- Beauty Retouch

## Global Checks

- Login creates stable `user_id`
- Credit sync from backend works
- Package gating matches active tier
- `Spark` cannot use `4 foto`
- `Signature` and `Prestige` can use `4 foto`
- Payment order creation works
- Proof upload works
- Admin approve/reject works
- Admin stats and beta status panel works

## Studio Foto AI

- Upload face succeeds
- Indoor background options render and generate correctly
- Outdoor premium location options affect result visibly
- Outfit selection is reflected in prompt/result
- Pose selection is reflected in result
- `2 foto` and `4 foto` charge the correct credits
- Failed generate refunds correctly

## Wisuda AI

- Female mode and male mode switch cleanly
- Outfit changes based on gender
- Toga dropdown changes result styling
- Salempang / medali appears correctly
- Props appear correctly
- Background set reflects selected studio style
- Pose follows selected gender dropdown
- Lighting remains clean and indoor premium

## Beauty Retouch

- Tab is hidden for `Spark`
- Tab is visible for `Signature` and `Prestige`
- Upload requires one clear portrait image
- Beauty style visibly changes polish level
- Body refinement remains subtle and believable
- Skin finish changes visual finish without plastic skin
- Outfit style changes styling direction
- Output always returns `2 foto`
- `Premium Polish` CTA appears on results
- Generate costs `2 kredit`

## Billing / Credit Checks

- `Studio Foto 2 foto = 1 kredit`
- `Studio Foto 4 foto = 2 kredit`
- `Wisuda 2 foto = 1 kredit`
- `Wisuda 4 foto = 2 kredit`
- `Beauty Retouch 2 foto = 2 kredit`
- Refund works on failed generation
- Top up increases credits without changing tier

## Limited Launch Monitoring

Track daily:

- approved orders
- proof uploaded count
- successful generates
- failed generates
- credits consumed per user
- retries per user
- most-used tab
- most-used preset combinations

## Exit Criteria

- Core routes stable
- Credit balance always consistent
- Package gating works in real usage
- Payment flow works end to end
- Beauty Retouch produces believable results
- Retry rate is acceptable
- Support load is manageable
