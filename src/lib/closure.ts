// Closure window: 7:00 AM – 3:30 PM (operations resume at 3:30 PM)
export const CLOSURE_START_MIN = 7 * 60;
export const CLOSURE_END_MIN = 15 * 60 + 30;

export const isWithinClosure = (date: Date = new Date()) => {
  const minutes = date.getHours() * 60 + date.getMinutes();
  return minutes >= CLOSURE_START_MIN && minutes < CLOSURE_END_MIN;
};

export const CLOSURE_MESSAGE =
  "We're temporarily closed between 7:00 AM and 3:30 PM. Operations resume at 3:30 PM.";
export const CLOSURE_EMAIL = "maceyrunners@gmail.com";
export const CLOSURE_WHATSAPP = "+592 721 9769";
export const CLOSURE_WHATSAPP_LINK = "https://wa.me/5927219769";
