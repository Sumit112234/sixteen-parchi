"use client"

// This component handles the AI opponent logic
export default class AIOpponent {
  constructor(difficulty = "medium") {
    this.difficulty = difficulty // 'easy', 'medium', 'hard'
    this.hand = []
    this.targetHero = null
    this.lastReceivedCard = null
  }

  // Set the AI's hand
  setHand(hand) {
    this.hand = [...hand]
    this.determineTargetHero()
  }

  // Set the last received card
  setLastReceivedCard(card) {
    this.lastReceivedCard = card
  }

  // Determine which hero the AI should collect
  determineTargetHero() {
    // Count cards by hero
    const heroCounts = {}
    this.hand.forEach((card) => {
      heroCounts[card.hero] = (heroCounts[card.hero] || 0) + 1
    })

    // Find the hero with the most cards
    let maxCount = 0
    let targetHero = null

    for (const [hero, count] of Object.entries(heroCounts)) {
      if (count > maxCount) {
        maxCount = count
        targetHero = hero
      }
    }

    this.targetHero = targetHero

    // For hard difficulty, if we have 2 or more of multiple heroes, choose the one with higher points
    if (this.difficulty === "hard" && maxCount >= 2) {
      const heroesWithMaxCount = Object.entries(heroCounts)
        .filter(([_, count]) => count === maxCount)
        .map(([hero]) => hero)

      if (heroesWithMaxCount.length > 1) {
        // Find the hero with the highest total points
        let maxPoints = 0
        let bestHero = targetHero

        for (const hero of heroesWithMaxCount) {
          const heroCards = this.hand.filter((card) => card.hero === hero)
          const totalPoints = heroCards.reduce((sum, card) => sum + card.points, 0)

          if (totalPoints > maxPoints) {
            maxPoints = totalPoints
            bestHero = hero
          }
        }

        this.targetHero = bestHero
      }
    }
  }

  // Choose a card to pass
  chooseCardToPass() {
    // If we have a last received card, we can't pass it unless we have multiple of that hero
    const lastReceivedHero = this.lastReceivedCard?.hero
    const heroCount = lastReceivedHero ? this.hand.filter((card) => card.hero === lastReceivedHero).length : 0

    const canPassLastReceived = heroCount > 1

    // Filter out cards we can pass
    let passableCards =
      this.lastReceivedCard && !canPassLastReceived
        ? this.hand.filter((card) => card !== this.lastReceivedCard)
        : [...this.hand]

    if (passableCards.length === 0) {
      // If we can't pass any other card, we have to pass the last received card
      passableCards = [...this.hand]
    }

    // Strategy based on difficulty
    switch (this.difficulty) {
      case "easy":
        // Easy: Random choice
        return this.getRandomCard(passableCards)

      case "medium":
        // Medium: Prioritize non-target hero cards
        return this.getMediumDifficultyCard(passableCards)

      case "hard":
        // Hard: Strategic choice
        return this.getHardDifficultyCard(passableCards)

      default:
        return this.getRandomCard(passableCards)
    }
  }

  // Get a random card from the hand
  getRandomCard(cards) {
    const index = Math.floor(Math.random() * cards.length)
    return {
      card: cards[index],
      index: this.hand.indexOf(cards[index]),
    }
  }

  // Medium difficulty: Prioritize passing non-target hero cards
  getMediumDifficultyCard(cards) {
    // First try to pass cards that are not our target hero
    const nonTargetCards = cards.filter((card) => card.hero !== this.targetHero)

    if (nonTargetCards.length > 0) {
      return this.getRandomCard(nonTargetCards)
    }

    // If we only have target hero cards, pass a random one
    return this.getRandomCard(cards)
  }

  // Hard difficulty: Strategic choice
  getHardDifficultyCard(cards) {
    // First try to pass cards that are not our target hero
    const nonTargetCards = cards.filter((card) => card.hero !== this.targetHero)

    if (nonTargetCards.length > 0) {
      // Find the hero with the least cards
      const heroCounts = {}
      nonTargetCards.forEach((card) => {
        heroCounts[card.hero] = (heroCounts[card.hero] || 0) + 1
      })

      let minCount = Number.POSITIVE_INFINITY
      let leastHero = null

      for (const [hero, count] of Object.entries(heroCounts)) {
        if (count < minCount) {
          minCount = count
          leastHero = hero
        }
      }

      // Pass a card of the hero we have the least of
      const leastHeroCards = nonTargetCards.filter((card) => card.hero === leastHero)
      return {
        card: leastHeroCards[0],
        index: this.hand.indexOf(leastHeroCards[0]),
      }
    }

    // If we only have target hero cards, pass a random one
    return this.getRandomCard(cards)
  }
}
