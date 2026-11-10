// Calculadora de Costo de Transferencia de Moto DNRPA 2026

const PROVINCES = [
  { id: "caba", name: "Ciudad de Buenos Aires (CABA)", sellos: 3.0 },
  { id: "pba", name: "Provincia de Buenos Aires (PBA)", sellos: 2.5 },
  { id: "cba", name: "Córdoba", sellos: 1.5 },
  { id: "sfe", name: "Santa Fe", sellos: 2.0 },
  { id: "mza", name: "Mendoza", sellos: 2.5 },
  { id: "eri", name: "Entre Ríos", sellos: 2.0 },
  { id: "tuc", name: "Tucumán", sellos: 1.5 },
  { id: "sal", name: "Salta", sellos: 1.5 },
  { id: "nqn", name: "Neuquén", sellos: 2.0 },
  { id: "rno", name: "Río Negro", sellos: 2.0 },
  { id: "chu", name: "Chubut", sellos: 1.5 },
  { id: "tdf", name: "Tierra del Fuego", sellos: 1.0 },
  { id: "otras", name: "Otras Provincias (Promedio)", sellos: 2.0 }
];

const FIXED_FEES = {
  cedula_moto: 12000,
  certificacion_firma_una: 16000,
  certificacion_firma_dos: 32000,
  verificacion_policial_f12: 20000,
  informe_dominio: 8000,
  alta_impositiva_municipal: 15000
};

function formatARS(val) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(val);
}

function initProvinces() {
  const sel = document.getElementById("provSelect");
  if (!sel) return;
  sel.innerHTML = "";
  PROVINCES.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.name} — Sellos ${p.sellos}%`;
    if (p.id === "pba") opt.selected = true;
    sel.appendChild(opt);
  });
}

function calculate() {
  const motoValue = Math.max(0, parseFloat(document.getElementById("motoValueInput").value) || 0);
  const provId = document.getElementById("provSelect").value;
  const isImportada = document.getElementById("originSelect").value === "importada";
  const hasDigital08 = document.getElementById("digital08Check").checked;
  const hasVerif = document.getElementById("verifCheck").checked;
  const hasInforme = document.getElementById("informeCheck").checked;
  const hasFirmasReg = document.getElementById("firmasRegCheck").checked;

  const prov = PROVINCES.find(p => p.id === provId) || PROVINCES[1];

  // 1. Arancel DNRPA (1% nacional o 2% importada, con 20% de descuento si es 08 digital)
  const baseArancelRate = isImportada ? 0.02 : 0.01;
  let arancelDnrpa = motoValue * baseArancelRate;
  let descuentoDigital = 0;
  if (hasDigital08) {
    descuentoDigital = arancelDnrpa * 0.20;
    arancelDnrpa = arancelDnrpa * 0.80;
  }

  // 2. Impuesto de Sellos provincial
  const sellosProv = motoValue * (prov.sellos / 100);

  // 3. Aranceles fijos DNRPA y Registrales
  const cedulaMoto = FIXED_FEES.cedula_moto;
  const firmas = hasFirmasReg ? FIXED_FEES.certificacion_firma_dos : 0;
  const verifF12 = hasVerif ? FIXED_FEES.verificacion_policial_f12 : 0;
  const informe = hasInforme ? FIXED_FEES.informe_dominio : 0;

  // Total
  const total = arancelDnrpa + sellosProv + cedulaMoto + firmas + verifF12 + informe;

  // Split habitual Comprador vs Vendedor
  const vendedorPaga = verifF12 + (hasFirmasReg ? FIXED_FEES.certificacion_firma_una : 0);
  const compradorPaga = total - vendedorPaga;

  // Update UI
  document.getElementById("resTotal").textContent = formatARS(total);
  document.getElementById("resPct").textContent = motoValue > 0 ? `${((total / motoValue) * 100).toFixed(1)}% del valor de la moto` : "0%";

  document.getElementById("valArancelDnrpa").textContent = formatARS(arancelDnrpa);
  document.getElementById("subArancelDnrpa").textContent = hasDigital08 
    ? `Base ${(baseArancelRate*100).toFixed(0)}% con -20% dto. 08 Digital`
    : `Tasa estándar ${(baseArancelRate*100).toFixed(0)}%`;

  document.getElementById("valSellos").textContent = formatARS(sellosProv);
  document.getElementById("subSellos").textContent = `${prov.name} (${prov.sellos}%)`;

  document.getElementById("valCedula").textContent = formatARS(cedulaMoto);
  document.getElementById("valFirmas").textContent = formatARS(firmas);
  document.getElementById("valVerif").textContent = formatARS(verifF12);
  document.getElementById("valInforme").textContent = formatARS(informe);

  document.getElementById("splitComprador").textContent = formatARS(compradorPaga);
  document.getElementById("splitVendedor").textContent = formatARS(vendedorPaga);
}

function applyPreset(val) {
  document.getElementById("motoValueInput").value = val;
  calculate();
}

function copyResult() {
  const val = document.getElementById("motoValueInput").value;
  const tot = document.getElementById("resTotal").textContent;
  const comp = document.getElementById("splitComprador").textContent;
  const vend = document.getElementById("splitVendedor").textContent;

  const txt = `🛵 Costo de Transferencia Moto (DNRPA 2026):\nValor de la moto: $${Number(val).toLocaleString('es-AR')}\nTotal a pagar: ${tot}\n- Comprador: ${comp}\n- Vendedor: ${vend}\nCalculá el tuyo en: https://sebiglesias.com.ar/transferencia-moto/`;

  navigator.clipboard.writeText(txt).then(() => {
    const btn = document.getElementById("btnCopy");
    const orig = btn.textContent;
    btn.textContent = "✅ ¡Copiado al portapapeles!";
    setTimeout(() => { btn.textContent = orig; }, 2000);
  });
}

function shareWa() {
  const val = document.getElementById("motoValueInput").value;
  const tot = document.getElementById("resTotal").textContent;
  const txt = `🛵 Estimación de Transferencia de Moto (DNRPA):\nValor moto: $${Number(val).toLocaleString('es-AR')}\nCosto total de transferencia: ${tot}\nhttps://sebiglesias.com.ar/transferencia-moto/`;
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(txt)}`, '_blank');
}

document.addEventListener("DOMContentLoaded", () => {
  initProvinces();
  calculate();

  document.getElementById("motoValueInput").addEventListener("input", calculate);
  document.getElementById("provSelect").addEventListener("change", calculate);
  document.getElementById("originSelect").addEventListener("change", calculate);
  document.getElementById("digital08Check").addEventListener("change", calculate);
  document.getElementById("verifCheck").addEventListener("change", calculate);
  document.getElementById("informeCheck").addEventListener("change", calculate);
  document.getElementById("firmasRegCheck").addEventListener("change", calculate);

  document.getElementById("btnCopy").addEventListener("click", copyResult);
  document.getElementById("btnWa").addEventListener("click", shareWa);
});
