// Base services
const baseServices = {
    bootstrapService: Symbol.for('bootstrapService'),
    errorService: Symbol.for('errorService'),
    exchangeService: Symbol.for('exchangeService'),
    mongoService: Symbol.for('mongoService'),
}

// Math services
const mathServices = {
    longTermMathService: Symbol.for('longTermMathService'),
    microTermMathService: Symbol.for('microTermMathService'),
    shortTermMathService: Symbol.for('shortTermMathService'),
    slopeDataMathService: Symbol.for('slopeDataMathService'),
    swingTermMathService: Symbol.for('swingTermMathService'),
    volumeDataMathService: Symbol.for('volumeDataMathService'),
}

// Client services
const clientServices = {
    longTermClientService: Symbol.for('longTermClientService'),
    microTermClientService: Symbol.for('microTermClientService'),
    shortTermClientService: Symbol.for('shortTermClientService'),
    slopeDataClientService: Symbol.for('slopeDataClientService'),
    swingTermClientService: Symbol.for('swingTermClientService'),
    volumeDataClientService: Symbol.for('volumeDataClientService'),
}

// DB services
const dbServices = {
    longTermDbService: Symbol.for('longTermDbService'),
    microTermDbService: Symbol.for('microTermDbService'),
    shortTermDbService: Symbol.for('shortTermDbService'),
    swingTermDbService: Symbol.for('swingTermDbService'),
    candleDataDbService: Symbol.for('candleDataDbService'),
}

// History services
const historyServices = {
    fifteenMinuteCandleHistoryService: Symbol.for('fifteenMinuteCandleHistoryService'),
    hourCandleHistoryService: Symbol.for('hourCandleHistoryService'),
    longTermHistoryService: Symbol.for('longTermHistoryService'),
    microTermHistoryService: Symbol.for('microTermHistoryService'),
    oneMinuteCandleHistoryService: Symbol.for('oneMinuteCandleHistoryService'),
    shortTermHistoryService: Symbol.for('shortTermHistoryService'),
    swingTermHistoryService: Symbol.for('swingTermHistoryService'),
    thirtyMinuteCandleHistoryService: Symbol.for('thirtyMinuteCandleHistoryService'),
}

// Job services
const jobServices = {
    commonJobService: Symbol.for('commonJobService'),
}

// View services
const viewServices = {
    candleViewService: Symbol.for('candleViewService'),
    longTermViewService: Symbol.for('longTermViewService'),
    microTermViewService: Symbol.for('microTermViewService'),
    shortTermViewService: Symbol.for('shortTermViewService'),
    swingTermViewService: Symbol.for('swingTermViewService'),
}

export const TYPES = {
    ...baseServices,
    ...mathServices,
    ...clientServices,
    ...dbServices,
    ...historyServices,
    ...jobServices,
    ...viewServices,
}
