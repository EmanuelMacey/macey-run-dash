import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navbar
      "nav.orderFood": "Order Food",
      "nav.howItWorks": "How It Works",
      "nav.services": "Services",
      "nav.pricing": "Pricing",
      "nav.login": "Log In",
      "nav.getStarted": "Get Started",
      "nav.theme": "Theme",

      // Hero
      "hero.badge": "#1 Delivery Service in Guyana",
      "hero.title1": "Get anything",
      "hero.title2": "delivered",
      "hero.title3": "fast",
      "hero.subtitle": "Food, groceries, packages, errands — MaceyRunners handles it all. Fast, reliable delivery across Georgetown and beyond.",
      "hero.placeOrder": "Place an Order",
      "hero.becomeRunner": "Become a Runner",
      "hero.avgDelivery": "15 min avg delivery",
      "hero.safe": "Safe & insured",
      "hero.tracking": "Real-time tracking",
      "hero.deliveriesDone": "Deliveries Done",
      "hero.rating": "Customer Rating",
      "hero.runnersOnline": "Runners Online",
      "hero.avgLabel": "Avg. Delivery",
      "hero.deliveries": "Deliveries",

      // How It Works
      "how.badge": "HOW IT WORKS",
      "how.title": "Three simple steps",
      "how.subtitle": "From order to doorstep in minutes.",
      "how.step1.title": "Place Your Order",
      "how.step1.desc": "Choose a delivery or errand, add your details, and select your payment method.",
      "how.step2.title": "Runner Accepts",
      "how.step2.desc": "A nearby runner picks up your order and heads to your location.",
      "how.step3.title": "Track & Receive",
      "how.step3.desc": "Follow your runner live on the map and get notified when they arrive.",

      // Services
      "services.badge": "OUR SERVICES",
      "services.title": "More than just delivery",
      "services.subtitle": "From groceries to errands — our runners handle it all so you don't have to.",
      "services.grocery.title": "Grocery Shopping",
      "services.grocery.desc": "Fresh groceries picked up from any store, delivered straight to your door.",
      "services.pharmacy.title": "Pharmacy Pick-Up",
      "services.pharmacy.desc": "Prescriptions and pharmacy essentials collected and delivered safely.",
      "services.document.title": "Document Courier",
      "services.document.desc": "Fast, secure delivery of contracts, letters, and important documents.",
      "services.retail.title": "Retail Shopping",
      "services.retail.desc": "We shop for you and bring your purchases right to your doorstep.",

      // Pricing
      "pricing.badge": "PRICING",
      "pricing.title": "Transparent pricing",
      "pricing.subtitle": "Distance-based rates you can count on. No hidden fees.",
      "pricing.delivery.name": "Delivery",
      "pricing.delivery.price": "From $700",
      "pricing.delivery.desc": "Food, groceries, and package delivery — priced by distance",
      "pricing.delivery.note": "Base rate $700 + distance",
      "pricing.errand.name": "Errand",
      "pricing.errand.price": "From $1,000",
      "pricing.errand.desc": "Let us handle your errands — priced by distance",
      "pricing.errand.note": "Base rate $1,000 + distance",
      "pricing.mostPopular": "Most Popular",
      "pricing.feature.tracking": "Real-time tracking",
      "pricing.feature.updates": "Live driver updates",
      "pricing.feature.payment": "Pay with card or cash",
      "pricing.feature.notifications": "Order notifications",
      "pricing.feature.chat": "Chat with your runner",
      "pricing.feature.everything": "Everything in Delivery",
      "pricing.feature.images": "Upload errand images",
      "pricing.feature.instructions": "Custom task instructions",
      "pricing.feature.priority": "Priority assignment",
      "pricing.feature.receipt": "Receipt confirmation",

      // Footer
      "footer.tagline": "Guyana's fastest delivery service. From food to errands, we get it done.",
      "footer.quickLinks": "Quick Links",
      "footer.contact": "Contact",
      "footer.aboutUs": "About Us",
      "footer.legal": "Legal",
      "footer.policies": "Policies & Terms",
      "footer.copyright": "© {{year}} MaceyRunners Delivery Service. All rights reserved.",

      // CTA
      "cta.title": "Ready to get started?",

      // Common
      "common.getStarted": "Get Started",
    },
  },
  es: {
    translation: {
      // Navbar
      "nav.orderFood": "Pedir Comida",
      "nav.howItWorks": "Cómo Funciona",
      "nav.services": "Servicios",
      "nav.pricing": "Precios",
      "nav.login": "Iniciar Sesión",
      "nav.getStarted": "Comenzar",
      "nav.theme": "Tema",

      // Hero
      "hero.badge": "#1 Servicio de Entrega en Guyana",
      "hero.title1": "Recibe cualquier cosa",
      "hero.title2": "entregada",
      "hero.title3": "rápido",
      "hero.subtitle": "Comida, compras, paquetes, mandados — MaceyRunners se encarga de todo. Entrega rápida y confiable en Georgetown y más allá.",
      "hero.placeOrder": "Hacer un Pedido",
      "hero.becomeRunner": "Ser un Runner",
      "hero.avgDelivery": "15 min promedio",
      "hero.safe": "Seguro y asegurado",
      "hero.tracking": "Seguimiento en tiempo real",
      "hero.deliveriesDone": "Entregas Hechas",
      "hero.rating": "Calificación",
      "hero.runnersOnline": "Runners En Línea",
      "hero.avgLabel": "Promedio",
      "hero.deliveries": "Entregas",

      // How It Works
      "how.badge": "CÓMO FUNCIONA",
      "how.title": "Tres pasos simples",
      "how.subtitle": "Del pedido a tu puerta en minutos.",
      "how.step1.title": "Haz tu Pedido",
      "how.step1.desc": "Elige entrega o mandado, agrega tus datos y selecciona tu método de pago.",
      "how.step2.title": "Runner Acepta",
      "how.step2.desc": "Un runner cercano recoge tu pedido y se dirige a tu ubicación.",
      "how.step3.title": "Rastrea y Recibe",
      "how.step3.desc": "Sigue a tu runner en vivo en el mapa y recibe notificaciones cuando llegue.",

      // Services
      "services.badge": "NUESTROS SERVICIOS",
      "services.title": "Más que solo entregas",
      "services.subtitle": "Desde compras hasta mandados — nuestros runners se encargan de todo.",
      "services.grocery.title": "Compras de Supermercado",
      "services.grocery.desc": "Productos frescos recogidos de cualquier tienda, entregados directo a tu puerta.",
      "services.pharmacy.title": "Recogida de Farmacia",
      "services.pharmacy.desc": "Recetas y esenciales de farmacia recogidos y entregados de forma segura.",
      "services.document.title": "Mensajería de Documentos",
      "services.document.desc": "Entrega rápida y segura de contratos, cartas y documentos importantes.",
      "services.retail.title": "Compras Personales",
      "services.retail.desc": "Compramos por ti y llevamos tus compras directamente a tu puerta.",

      // Pricing
      "pricing.badge": "PRECIOS",
      "pricing.title": "Precios transparentes",
      "pricing.subtitle": "Tarifas basadas en distancia en las que puedes confiar. Sin cargos ocultos.",
      "pricing.delivery.name": "Entrega",
      "pricing.delivery.price": "Desde $700",
      "pricing.delivery.desc": "Comida, compras y paquetes — precio por distancia",
      "pricing.delivery.note": "Tarifa base $700 + distancia",
      "pricing.errand.name": "Mandado",
      "pricing.errand.price": "Desde $1,000",
      "pricing.errand.desc": "Nosotros hacemos tus mandados — precio por distancia",
      "pricing.errand.note": "Tarifa base $1,000 + distancia",
      "pricing.mostPopular": "Más Popular",
      "pricing.feature.tracking": "Seguimiento en tiempo real",
      "pricing.feature.updates": "Actualizaciones en vivo",
      "pricing.feature.payment": "Paga con tarjeta o efectivo",
      "pricing.feature.notifications": "Notificaciones de pedido",
      "pricing.feature.chat": "Chatea con tu runner",
      "pricing.feature.everything": "Todo lo de Entrega",
      "pricing.feature.images": "Sube imágenes del mandado",
      "pricing.feature.instructions": "Instrucciones personalizadas",
      "pricing.feature.priority": "Asignación prioritaria",
      "pricing.feature.receipt": "Confirmación de recibo",

      // Footer
      "footer.tagline": "El servicio de entrega más rápido de Guyana. De comida a mandados, lo hacemos.",
      "footer.quickLinks": "Enlaces Rápidos",
      "footer.contact": "Contacto",
      "footer.aboutUs": "Sobre Nosotros",
      "footer.legal": "Legal",
      "footer.policies": "Políticas y Términos",
      "footer.copyright": "© {{year}} MaceyRunners Servicio de Entrega. Todos los derechos reservados.",

      // CTA
      "cta.title": "¿Listo para comenzar?",

      // Common
      "common.getStarted": "Comenzar",
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
