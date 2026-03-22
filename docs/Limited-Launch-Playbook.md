# Limited Launch Playbook

## Goal

Run PotretAI in a controlled beta with 10-20 paying users, validate unit economics, then decide when to scale.

## Launch Scope

- Open only `Studio Foto AI` and `Wisuda AI`
- Default all generate flows to `2 foto`
- Keep `4 foto` for `Signature` and `Prestige` only
- Start with the most stable presets and premium-ready dropdown combinations

## User Cohort

- Invite 10-20 users only
- Mix of:
  - 5-8 repeat friendly testers
  - 3-5 real paying users
  - 2-4 premium-intent users
- Record each user's tier, start date, and package source

## Metrics To Watch Daily

- Total successful generates
- Unique active users
- Total approved revenue
- Average credits consumed per user
- Average retries per user
- Percentage of users who use `4 foto`
- Error rate by endpoint:
  - `/upload-face`
  - `/generate-pulid`
  - `/generate-instantid`
- Most-used service:
  - `studio_foto`
  - `wisuda`

## Metrics To Review Per User

- Credits granted
- Credits consumed
- Credits refunded
- Retry frequency
- Most-used location / outfit / pose combination
- Satisfaction notes from manual support chat

## Cost Review Checklist

- Compare `photo_count` usage against expected package behavior
- Identify users who retry too often before they are satisfied
- Identify presets with high failure rate or weak visual consistency
- Estimate HPP by segment:
  - Spark user
  - Signature user
  - Prestige user

## Operational Rules During Beta

- Do not expand library access too early
- Do not promote `4 foto` as default
- Do not unlock all locations for `Spark`
- Manually review high-retry users before offering free compensation
- Only approve payment orders with valid proof and matching order id

## Suggested Daily Review Routine

1. Check approved orders
2. Check generate success/failure logs
3. Check credit balance anomalies
4. Check top retry users
5. Check which presets are producing the best conversion-quality output

## Exit Criteria Before Scale

- Error rate is consistently low
- Most users are satisfied within a small number of retries
- Signature package shows healthy margin
- Backend credit enforcement is stable
- Payment proof and approval flow works reliably
- Support burden is manageable

## Immediate Next Step After Beta

- Adjust pricing if needed
- Refine curated library for Spark
- Keep Signature as the main package
- Expand Prestige benefits only after economics are proven
