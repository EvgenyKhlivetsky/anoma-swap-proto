# Anoma Intent Swap

Intent-based multi-chain token swap prototype for Anoma @In-Tents Tuesday.

## What is this?

Instead of manually selecting DEXes and routes, just tell it what you want to swap. The app finds the best path across multiple chains.

## Features

- Express trading intent (not execution steps)
- Multi-chain support (ETH, ARB, OP, MATIC, SOL)
- Mock wallet with balance validation
- Privacy preferences
- Realistic pricing simulation

## Setup

```bash
npm install
npm run dev
```

## How it works

1. Connect wallet
2. Enter what you want to give/receive
3. App finds optimal routes
4. Execute the swap

All functionality is mocked but uses realistic data and UX flows.

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Mock pricing from "real" rates
