import { forwardRef } from "react";
import { Invoice, CompanyProfile, Client } from "@/lib/schema";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

interface InvoicePDFProps {
  invoice: Invoice;
  company: CompanyProfile;
  client: Client | undefined;
  template?: "modern" | "corporate" | "minimal" | "modern-minimal" | "corporate-pro" | "creative" | "elegant" | "simple";
}

const InvoicePDF = forwardRef<HTMLDivElement, InvoicePDFProps>(
  ({ invoice, company, client, template = "modern" }, ref) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  const currency = invoice.currency || "USD";

  // --- Templates ---
  
  // 1. Modern Template (Gradient Header)
  if (template === "modern") {
    return (
      <div ref={ref} className="bg-white text-slate-900 w-[210mm] min-h-[297mm] mx-auto shadow-2xl overflow-hidden print:shadow-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-12 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">INVOICE</h1>
              <p className="text-blue-100 font-medium opacity-90">#{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              {company.logo && <img src={company.logo} alt="Logo" className="h-16 mb-4 object-contain ml-auto bg-white/10 rounded-lg p-2 backdrop-blur-sm" />}
              <h3 className="font-bold text-xl">{company.companyName}</h3>
              <div className="text-blue-100 text-sm mt-1 opacity-90 leading-relaxed">
                <p>{company.address}</p>
                <p>{company.email}</p>
                <p>{company.phone}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-12">
          {/* Bill To & Details */}
          <div className="flex justify-between mb-12">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Bill To</h4>
              {client ? (
                <div className="text-slate-800">
                  <h3 className="font-bold text-lg text-indigo-900">{client.name}</h3>
                  {client.company && <p className="font-medium">{client.company}</p>}
                  <p className="text-slate-500 mt-1">{client.address}</p>
                  <p className="text-slate-500">{client.email}</p>
                </div>
              ) : (
                <p className="text-slate-400 italic">No client selected</p>
              )}
            </div>
            <div className="text-right space-y-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Date Issued</span>
                <span className="font-semibold text-slate-700">{formatDate(invoice.date)}</span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Due Date</span>
                <span className="font-semibold text-slate-700">{formatDate(invoice.dueDate)}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-8">
            <thead className="border-b-2 border-slate-100">
              <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-4 pl-4">Description</th>
                <th className="pb-4 text-center">Qty</th>
                <th className="pb-4 text-right">Price</th>
                <th className="pb-4 pr-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 text-sm">
              {invoice.items.map((item, index) => (
                <tr key={item.id || index} className="border-b border-slate-50">
                  <td className="py-4 pl-4">
                    <p className="font-semibold text-slate-800">{item.name}</p>
                    {item.description && <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>}
                  </td>
                  <td className="py-4 text-center">{item.quantity}</td>
                  <td className="py-4 text-right">{formatCurrency(item.price, currency)}</td>
                  <td className="py-4 pr-4 text-right font-medium text-slate-800">
                    {formatCurrency(item.price * item.quantity, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-12">
            <div className="w-1/2 space-y-3">
              <div className="flex justify-between text-slate-500 text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.subtotal, currency)}</span>
              </div>
              
              {company.discountEnabled && invoice.discountValue > 0 && (
                <div className="flex justify-between text-green-600 text-sm">
                  <span>Discount {invoice.discountType === 'percentage' ? `(${invoice.discountValue}%)` : ''}</span>
                  <span>-{formatCurrency(invoice.discountType === 'percentage' 
                    ? (invoice.subtotal * invoice.discountValue / 100) 
                    : invoice.discountValue, currency)}</span>
                </div>
              )}

              {company.taxEnabled && invoice.taxTotal > 0 && (
                <div className="flex justify-between text-slate-500 text-sm">
                  <span>Tax ({company.defaultVat}%)</span>
                  <span>{formatCurrency(invoice.taxTotal, currency)}</span>
                </div>
              )}

              <div className="flex justify-between items-center border-t-2 border-indigo-100 pt-4 mt-4">
                <span className="font-bold text-indigo-900 text-lg">Grand Total</span>
                <span className="font-bold text-indigo-600 text-2xl">{formatCurrency(invoice.grandTotal, currency)}</span>
              </div>
            </div>
          </div>

          {/* Footer / Notes */}
          <div className="grid grid-cols-2 gap-8 border-t border-slate-100 pt-8">
            <div>
              <h4 className="font-bold text-sm text-indigo-900 mb-2">Payment Info</h4>
              <p className="text-sm text-slate-500 mb-1"><span className="font-semibold">Bank:</span> {company.bankName}</p>
              <p className="text-sm text-slate-500 mb-1"><span className="font-semibold">Account:</span> {company.bankAccount}</p>
              {company.taxId && <p className="text-sm text-slate-500"><span className="font-semibold">Tax ID:</span> {company.taxId}</p>}
            </div>
            
            {(invoice.notes || invoice.signature) && (
              <div className="text-right">
                 {invoice.signature && (
                    <div className="mb-4 flex flex-col items-end">
                      <img src={invoice.signature} alt="Signature" className="h-16 object-contain" />
                      <div className="w-32 border-t border-slate-300 mt-1"></div>
                      <p className="text-xs text-slate-400 mt-1">Authorized Signature</p>
                    </div>
                 )}
                 {invoice.notes && (
                   <div className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg text-left">
                     <p className="font-semibold text-xs text-slate-400 uppercase mb-1">Notes</p>
                     {invoice.notes}
                   </div>
                 )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. Corporate Template (Blue Header)
  if (template === "corporate") {
    return (
      <div ref={ref} className="bg-white text-slate-900 w-[210mm] min-h-[297mm] mx-auto shadow-2xl print:shadow-none">
        <div className="p-16">
          <div className="flex justify-between items-start border-b-4 border-blue-800 pb-8 mb-8">
            <div className="flex items-center gap-4">
              {company.logo && <img src={company.logo} alt="Logo" className="h-20 w-auto object-contain" />}
              <div>
                <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-widest">{company.companyName}</h1>
                <div className="text-sm text-slate-500 mt-1">
                  <p>{company.address}</p>
                  <p>{company.email} | {company.phone}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-5xl font-extrabold text-slate-200">INVOICE</h2>
              <p className="text-blue-800 font-bold text-xl mt-2">#{invoice.invoiceNumber}</p>
            </div>
          </div>

          <div className="flex justify-between mb-12">
            <div>
              <p className="font-bold text-blue-800 uppercase text-xs tracking-wider mb-2">Invoice To:</p>
              {client ? (
                <div className="text-slate-700">
                  <h3 className="font-bold text-lg">{client.name}</h3>
                  <p>{client.company}</p>
                  <p className="text-sm mt-1">{client.address}</p>
                  <p className="text-sm">{client.email}</p>
                </div>
              ) : <p className="text-slate-400">No client</p>}
            </div>
            <div className="bg-slate-50 p-6 rounded-lg min-w-[200px]">
              <div className="flex justify-between mb-2">
                <span className="font-medium text-slate-500">Date:</span>
                <span className="font-bold text-slate-800">{formatDate(invoice.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-500">Due:</span>
                <span className="font-bold text-red-600">{formatDate(invoice.dueDate)}</span>
              </div>
            </div>
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr className="bg-blue-800 text-white text-sm uppercase">
                <th className="py-3 px-4 text-left rounded-l-md">Item</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-right rounded-r-md">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td className="py-4 px-4 font-medium">{item.name}</td>
                  <td className="py-4 px-4 text-center">{item.quantity}</td>
                  <td className="py-4 px-4 text-right">{formatCurrency(item.price, currency)}</td>
                  <td className="py-4 px-4 text-right font-bold text-slate-800">
                    {formatCurrency(item.price * item.quantity, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-12">
            <div className="w-1/3 space-y-2 text-right">
              <div className="flex justify-between font-medium text-slate-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal, currency)}</span>
              </div>
              {company.discountEnabled && invoice.discountValue > 0 && (
                <div className="flex justify-between font-medium text-green-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(invoice.discountType === 'percentage' ? (invoice.subtotal * invoice.discountValue / 100) : invoice.discountValue, currency)}</span>
                </div>
              )}
               {company.taxEnabled && invoice.taxTotal > 0 && (
                <div className="flex justify-between font-medium text-slate-600">
                  <span>Tax ({company.defaultVat}%):</span>
                  <span>{formatCurrency(invoice.taxTotal, currency)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xl text-blue-800 border-t-2 border-blue-800 pt-2 mt-2">
                <span>Total:</span>
                <span>{formatCurrency(invoice.grandTotal, currency)}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-8 text-slate-500 text-sm flex justify-between items-end">
            <div>
              <p className="font-bold text-slate-800 mb-1">Bank Details:</p>
              <p>{company.bankName} - {company.bankAccount}</p>
              <p className="mt-2 text-xs">Thank you for your business!</p>
            </div>
            {invoice.signature && (
               <div className="text-center">
                 <img src={invoice.signature} className="h-12 object-contain mb-1 mx-auto" alt="Sig" />
                 <p className="border-t border-slate-300 px-8 pt-1 text-xs">Authorized Signature</p>
               </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. Minimal Template
  if (template === "minimal") {
    return (
      <div ref={ref} className="bg-white text-black w-[210mm] min-h-[297mm] mx-auto shadow-2xl print:shadow-none p-16 font-mono">
        <div className="border-b-2 border-black pb-8 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold mb-4">INVOICE</h1>
            <div className="space-y-1 text-sm">
               <p className="font-bold">{company.companyName}</p>
               <p>{company.address}</p>
               <p>{company.email}</p>
            </div>
          </div>
          <div className="text-right">
             {company.logo && <img src={company.logo} alt="Logo" className="h-12 mb-4 ml-auto grayscale" />}
             <p className="text-xl font-bold">#{invoice.invoiceNumber}</p>
             <p>Date: {formatDate(invoice.date)}</p>
          </div>
        </div>

        <div className="mb-12">
          <p className="font-bold border-b border-black inline-block mb-2">BILL TO</p>
          {client ? (
            <div className="space-y-1">
              <p className="font-bold text-lg">{client.name}</p>
              <p>{client.company}</p>
              <p>{client.address}</p>
            </div>
          ) : <p>No Client</p>}
        </div>

        <table className="w-full mb-8">
          <thead>
             <tr className="border-b-2 border-black text-sm">
               <th className="text-left py-2">ITEM</th>
               <th className="text-center py-2">QTY</th>
               <th className="text-right py-2">PRICE</th>
               <th className="text-right py-2">TOTAL</th>
             </tr>
          </thead>
          <tbody className="text-sm">
            {invoice.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-3">{item.name}</td>
                <td className="py-3 text-center">{item.quantity}</td>
                <td className="py-3 text-right">{formatCurrency(item.price, currency)}</td>
                <td className="py-3 text-right font-bold">{formatCurrency(item.price * item.quantity, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-12">
           <div className="w-1/2 space-y-2">
              <div className="flex justify-between">
                <span>SUBTOTAL</span>
                <span>{formatCurrency(invoice.subtotal, currency)}</span>
              </div>
              {company.discountEnabled && invoice.discountValue > 0 && (
                <div className="flex justify-between">
                  <span>DISCOUNT</span>
                  <span>-{formatCurrency(invoice.discountType === 'percentage' ? (invoice.subtotal * invoice.discountValue / 100) : invoice.discountValue, currency)}</span>
                </div>
              )}
               {company.taxEnabled && (
                 <div className="flex justify-between">
                  <span>TAX</span>
                  <span>{formatCurrency(invoice.taxTotal, currency)}</span>
                </div>
               )}
              <div className="flex justify-between font-bold text-xl border-t-2 border-black pt-2">
                <span>TOTAL</span>
                <span>{formatCurrency(invoice.grandTotal, currency)}</span>
              </div>
           </div>
        </div>

        <div className="text-sm space-y-4">
          <div>
            <p className="font-bold">PAYMENT DETAILS</p>
            <p>Bank: {company.bankName}</p>
            <p>Account: {company.bankAccount}</p>
          </div>
          
          {invoice.notes && (
            <div className="border border-black p-4">
               <p className="font-bold mb-1">NOTES</p>
               <p>{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. Modern Minimal Template - Clean, white space, neutral with blue accent
  if (template === "modern-minimal") {
    return (
      <div ref={ref} className="bg-white text-gray-900 w-[210mm] min-h-[297mm] mx-auto shadow-2xl print:shadow-none p-16">
        {/* Header */}
        <div className="flex justify-between items-start mb-16">
          <div>
            {company.logo && <img src={company.logo} alt="Logo" className="h-12 mb-4 object-contain" />}
            <div className="text-sm text-gray-500 space-y-1">
              <p className="font-semibold text-gray-900">{company.companyName}</p>
              <p>{company.address}</p>
              <p>{company.email}</p>
              <p>{company.phone}</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-5xl font-light text-gray-900 tracking-tight">INVOICE</h1>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex justify-end gap-8">
                <span className="text-gray-400">Invoice #</span>
                <span className="font-medium text-gray-900">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-end gap-8">
                <span className="text-gray-400">Issue Date</span>
                <span className="font-medium text-gray-900">{formatDate(invoice.date)}</span>
              </div>
              <div className="flex justify-end gap-8">
                <span className="text-gray-400">Due Date</span>
                <span className="font-medium text-gray-900">{formatDate(invoice.dueDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Client Section */}
        <div className="mb-12 pb-8 border-b border-gray-100">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Bill To</p>
          {client ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
              {client.company && <p className="text-gray-600">{client.company}</p>}
              <p className="text-gray-500 text-sm mt-1">{client.address}</p>
              <p className="text-gray-500 text-sm">{client.email}</p>
            </div>
          ) : (
            <p className="text-gray-400 italic">No client selected</p>
          )}
        </div>

        {/* Items Table */}
        <table className="w-full mb-12">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
              <th className="text-center py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Qty</th>
              <th className="text-right py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Unit Price</th>
              <th className="text-right py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Tax</th>
              <th className="text-right py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {invoice.items.map((item, index) => (
              <tr key={item.id || index} className="border-b border-gray-100">
                <td className="py-4">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  {item.description && <p className="text-gray-400 text-xs mt-0.5">{item.description}</p>}
                </td>
                <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                <td className="py-4 text-right text-gray-600">{formatCurrency(item.price, currency)}</td>
                <td className="py-4 text-right text-gray-600">
                  {company.taxEnabled ? formatCurrency((item.price * item.quantity * company.defaultVat) / 100, currency) : '-'}
                </td>
                <td className="py-4 text-right font-medium text-gray-900">
                  {formatCurrency(item.price * item.quantity, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-16">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal, currency)}</span>
            </div>
            {company.taxEnabled && invoice.taxTotal > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax</span>
                <span>{formatCurrency(invoice.taxTotal, currency)}</span>
              </div>
            )}
            {company.discountEnabled && invoice.discountValue > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(invoice.discountType === 'percentage' 
                  ? (invoice.subtotal * invoice.discountValue / 100) 
                  : invoice.discountValue, currency)}</span>
              </div>
            )}
            <div className="flex justify-between items-center border-t-2 border-blue-500 pt-3 mt-3">
              <span className="font-semibold text-gray-900">Grand Total</span>
              <span className="text-2xl font-bold text-blue-600">{formatCurrency(invoice.grandTotal, currency)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 pt-8 flex justify-between items-start">
          <div className="text-sm text-gray-500">
            <p className="font-medium text-gray-900 mb-2">Payment Instructions</p>
            <p>Bank: {company.bankName}</p>
            <p>Account: {company.bankAccount}</p>
            {company.taxId && <p className="mt-2">Tax ID: {company.taxId}</p>}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400 italic">Thank you for your business!</p>
            {invoice.signature && (
              <div className="mt-4">
                <img src={invoice.signature} alt="Signature" className="h-12 object-contain ml-auto" />
                <div className="w-24 border-t border-gray-300 mt-2 ml-auto"></div>
                <p className="text-xs text-gray-400 mt-1">Authorized</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 5. Corporate Professional Template - Formal, dark blue/gray
  if (template === "corporate-pro") {
    return (
      <div ref={ref} className="bg-white text-slate-800 w-[210mm] min-h-[297mm] mx-auto shadow-2xl print:shadow-none">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-8">
          <div className="flex justify-center items-center gap-4">
            {company.logo && <img src={company.logo} alt="Logo" className="h-16 object-contain bg-white/10 rounded p-2" />}
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-wider">{company.companyName}</h1>
              <p className="text-slate-400 text-sm">{company.address}</p>
            </div>
          </div>
        </div>

        <div className="p-12">
          {/* Invoice Details Bar */}
          <div className="flex justify-end mb-12">
            <div className="bg-slate-100 p-6 grid grid-cols-2 gap-x-12 gap-y-3 text-sm">
              <div>
                <p className="text-slate-500 text-xs uppercase">Invoice Number</p>
                <p className="font-bold text-slate-800">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase">Date</p>
                <p className="font-bold text-slate-800">{formatDate(invoice.date)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase">Due Date</p>
                <p className="font-bold text-red-600">{formatDate(invoice.dueDate)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase">PO Number</p>
                <p className="font-bold text-slate-800">-</p>
              </div>
            </div>
          </div>

          {/* Two Column Section */}
          <div className="grid grid-cols-2 gap-12 mb-12">
            <div className="bg-slate-50 p-6 rounded">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">From</p>
              <h3 className="font-bold text-lg text-slate-800">{company.companyName}</h3>
              <p className="text-slate-600 text-sm mt-1">{company.address}</p>
              <p className="text-slate-600 text-sm">{company.email}</p>
              <p className="text-slate-600 text-sm">{company.phone}</p>
            </div>
            <div className="bg-blue-50 p-6 rounded border-l-4 border-blue-800">
              <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3">Bill To</p>
              {client ? (
                <>
                  <h3 className="font-bold text-lg text-slate-800">{client.name}</h3>
                  {client.company && <p className="text-slate-600 font-medium">{client.company}</p>}
                  <p className="text-slate-600 text-sm mt-1">{client.address}</p>
                  <p className="text-slate-600 text-sm">{client.email}</p>
                </>
              ) : (
                <p className="text-slate-400 italic">No client</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="bg-slate-200 text-slate-700 text-xs uppercase tracking-wider">
                <th className="py-3 px-4 text-left font-bold">Description</th>
                <th className="py-3 px-4 text-center font-bold">Qty</th>
                <th className="py-3 px-4 text-right font-bold">Unit Price</th>
                <th className="py-3 px-4 text-right font-bold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={item.id || index} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="py-4 px-4">
                    <p className="font-medium text-slate-800">{item.name}</p>
                    {item.description && <p className="text-xs text-slate-500">{item.description}</p>}
                  </td>
                  <td className="py-4 px-4 text-center">{item.quantity}</td>
                  <td className="py-4 px-4 text-right">{formatCurrency(item.price, currency)}</td>
                  <td className="py-4 px-4 text-right font-bold text-slate-800">
                    {formatCurrency(item.price * item.quantity, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Box */}
          <div className="flex justify-end mb-12">
            <div className="bg-slate-100 p-6 w-80 space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium">{formatCurrency(invoice.subtotal, currency)}</span>
              </div>
              {company.taxEnabled && invoice.taxTotal > 0 && (
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Tax ({company.defaultVat}%)</span>
                  <span className="font-medium">{formatCurrency(invoice.taxTotal, currency)}</span>
                </div>
              )}
              {company.discountEnabled && invoice.discountValue > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">-{formatCurrency(invoice.discountType === 'percentage' 
                    ? (invoice.subtotal * invoice.discountValue / 100) 
                    : invoice.discountValue, currency)}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t-2 border-slate-800 pt-3 mt-3">
                <span className="font-bold text-slate-800">Grand Total</span>
                <span className="text-xl font-bold text-slate-900">{formatCurrency(invoice.grandTotal, currency)}</span>
              </div>
            </div>
          </div>

          {/* Banking Details */}
          <div className="border-t border-slate-200 pt-8">
            <div className="bg-blue-50 p-6 rounded">
              <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3">Banking Details</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Bank Name</p>
                  <p className="font-medium text-slate-800">{company.bankName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Account Number</p>
                  <p className="font-medium text-slate-800">{company.bankAccount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
            <div>
              {company.taxId && <p>Tax ID: {company.taxId}</p>}
              <p className="mt-1">Company Registration: {company.companyName}</p>
            </div>
            {invoice.signature && (
              <div className="text-center">
                <img src={invoice.signature} alt="Signature" className="h-10 object-contain mb-1 mx-auto" />
                <div className="w-32 border-t border-slate-300 mx-auto"></div>
                <p className="mt-1">Authorized Signature</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 6. Creative & Colorful Template - Bold colors for designers
  if (template === "creative") {
    return (
      <div ref={ref} className="bg-white text-slate-800 w-[210mm] min-h-[297mm] mx-auto shadow-2xl print:shadow-none overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-100 via-orange-50 to-teal-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-teal-100 via-purple-50 to-orange-50 rounded-full translate-y-1/2 -translate-x-1/2 opacity-60"></div>
        
        <div className="relative p-16">
          {/* Center Logo */}
          <div className="flex justify-center mb-8">
            {company.logo ? (
              <img src={company.logo} alt="Logo" className="h-20 object-contain" />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-orange-400 to-teal-400 rounded-2xl flex items-center justify-center">
                <span className="text-white text-2xl font-bold">{company.companyName.charAt(0)}</span>
              </div>
            )}
          </div>

          {/* Large Stylized Invoice */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-orange-500 to-teal-500 tracking-tight">
              INVOICE
            </h1>
            <p className="text-slate-400 mt-2">#{invoice.invoiceNumber}</p>
          </div>

          {/* Invoice Info Cards */}
          <div className="flex justify-center gap-6 mb-12">
            <div className="bg-purple-50 px-6 py-3 rounded-xl text-center">
              <p className="text-xs text-purple-500 uppercase font-bold">Issue Date</p>
              <p className="font-semibold text-slate-800">{formatDate(invoice.date)}</p>
            </div>
            <div className="bg-orange-50 px-6 py-3 rounded-xl text-center">
              <p className="text-xs text-orange-500 uppercase font-bold">Due Date</p>
              <p className="font-semibold text-slate-800">{formatDate(invoice.dueDate)}</p>
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-slate-50 rounded-2xl p-8 mb-8">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Bill To</p>
            {client ? (
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{client.name}</h3>
                  {client.company && <p className="text-slate-600 font-medium">{client.company}</p>}
                  <p className="text-slate-500 text-sm mt-2">{client.address}</p>
                  <p className="text-slate-500 text-sm">{client.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic">No client selected</p>
            )}
          </div>

          {/* Items Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-4 text-sm font-bold text-slate-600">Item</th>
                <th className="text-center py-4 text-sm font-bold text-slate-600">Qty</th>
                <th className="text-right py-4 text-sm font-bold text-slate-600">Price</th>
                <th className="text-right py-4 text-sm font-bold text-slate-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={item.id || index} className="border-b border-slate-100">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-teal-100 flex items-center justify-center text-sm font-bold text-slate-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{item.name}</p>
                        {item.description && <p className="text-xs text-slate-400">{item.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-center">{item.quantity}</td>
                  <td className="py-4 text-right">{formatCurrency(item.price, currency)}</td>
                  <td className="py-4 text-right font-bold">{formatCurrency(item.price * item.quantity, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total Section */}
          <div className="flex justify-end mb-8">
            <div className="w-80 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.subtotal, currency)}</span>
              </div>
              {company.taxEnabled && invoice.taxTotal > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax</span>
                  <span>{formatCurrency(invoice.taxTotal, currency)}</span>
                </div>
              )}
              {company.discountEnabled && invoice.discountValue > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(invoice.discountType === 'percentage' 
                    ? (invoice.subtotal * invoice.discountValue / 100) 
                    : invoice.discountValue, currency)}</span>
                </div>
              )}
              <div className="bg-gradient-to-r from-purple-600 via-orange-500 to-teal-500 p-4 rounded-2xl mt-4">
                <div className="flex justify-between items-center text-white">
                  <span className="font-medium">Grand Total</span>
                  <span className="text-3xl font-black">{formatCurrency(invoice.grandTotal, currency)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Friendly Message */}
          <div className="bg-gradient-to-r from-teal-50 via-purple-50 to-orange-50 p-6 rounded-2xl text-center">
            <p className="text-slate-600 italic">✨ Thank you for choosing us! We appreciate your business and look forward to working with you again. ✨</p>
            <div className="mt-4 text-sm text-slate-500">
              <p>Payment: {company.bankName} - {company.bankAccount}</p>
            </div>
          </div>

          {invoice.signature && (
            <div className="mt-8 text-center">
              <img src={invoice.signature} alt="Signature" className="h-16 object-contain mx-auto" />
              <div className="w-32 border-t border-slate-300 mx-auto mt-2"></div>
              <p className="text-xs text-slate-400 mt-1">Authorized</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 7. Elegant Luxury Template - Black, gold, white, serif fonts
  if (template === "elegant") {
    return (
      <div ref={ref} className="bg-white text-slate-900 w-[210mm] min-h-[297mm] mx-auto shadow-2xl print:shadow-none p-16" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        {/* Minimal Header with Gold Line */}
        <div className="text-center mb-12">
          {company.logo && <img src={company.logo} alt="Logo" className="h-16 mx-auto mb-4 object-contain" />}
          <h1 className="text-3xl font-normal tracking-widest text-slate-900 uppercase" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {company.companyName}
          </h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 mx-auto mt-4"></div>
        </div>

        {/* Invoice Title */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-light italic text-slate-800" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Invoice</h2>
          <p className="text-slate-400 mt-2 tracking-widest text-sm">NO. {invoice.invoiceNumber}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-8 mb-12 text-center">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Date</p>
            <p className="text-slate-800">{formatDate(invoice.date)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Due Date</p>
            <p className="text-slate-800">{formatDate(invoice.dueDate)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Amount Due</p>
            <p className="text-slate-800 font-medium">{formatCurrency(invoice.grandTotal, currency)}</p>
          </div>
        </div>

        {/* Gold Divider */}
        <div className="border-t border-yellow-400 mb-12"></div>

        {/* Bill To */}
        <div className="mb-12 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">Bill To</p>
          {client ? (
            <div>
              <h3 className="text-2xl font-normal text-slate-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{client.name}</h3>
              {client.company && <p className="text-slate-600 italic mt-1">{client.company}</p>}
              <p className="text-slate-500 text-sm mt-2">{client.address}</p>
              <p className="text-slate-500 text-sm">{client.email}</p>
            </div>
          ) : (
            <p className="text-slate-400 italic">No client selected</p>
          )}
        </div>

        {/* Items Table with Gold Borders */}
        <table className="w-full mb-12">
          <thead>
            <tr className="border-t border-b border-yellow-400">
              <th className="py-4 text-left text-xs uppercase tracking-widest text-slate-500 font-normal">Description</th>
              <th className="py-4 text-center text-xs uppercase tracking-widest text-slate-500 font-normal">Qty</th>
              <th className="py-4 text-right text-xs uppercase tracking-widest text-slate-500 font-normal">Price</th>
              <th className="py-4 text-right text-xs uppercase tracking-widest text-slate-500 font-normal">Total</th>
            </tr>
          </thead>
          <tbody style={{ fontFamily: "'Inter', sans-serif" }}>
            {invoice.items.map((item, index) => (
              <tr key={item.id || index} className="border-b border-yellow-200">
                <td className="py-4">
                  <p className="font-medium text-slate-800">{item.name}</p>
                  {item.description && <p className="text-xs text-slate-400">{item.description}</p>}
                </td>
                <td className="py-4 text-center">{item.quantity}</td>
                <td className="py-4 text-right">{formatCurrency(item.price, currency)}</td>
                <td className="py-4 text-right font-medium">{formatCurrency(item.price * item.quantity, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-12">
          <div className="w-72 space-y-3" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal, currency)}</span>
            </div>
            {company.taxEnabled && invoice.taxTotal > 0 && (
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tax</span>
                <span>{formatCurrency(invoice.taxTotal, currency)}</span>
              </div>
            )}
            {company.discountEnabled && invoice.discountValue > 0 && (
              <div className="flex justify-between text-sm text-slate-600">
                <span>Discount</span>
                <span>-{formatCurrency(invoice.discountType === 'percentage' 
                  ? (invoice.subtotal * invoice.discountValue / 100) 
                  : invoice.discountValue, currency)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Grand Total in Gold Box */}
        <div className="bg-gradient-to-r from-yellow-50 via-yellow-100 to-yellow-50 border border-yellow-400 p-6 mb-12">
          <div className="flex justify-between items-center">
            <span className="text-slate-700 uppercase tracking-widest text-sm">Grand Total</span>
            <span className="text-4xl font-light text-slate-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {formatCurrency(invoice.grandTotal, currency)}
            </span>
          </div>
        </div>

        {/* Footer with Signature */}
        <div className="border-t border-yellow-400 pt-8">
          <div className="flex justify-between items-end">
            <div style={{ fontFamily: "'Inter', sans-serif" }}>
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Payment Details</p>
              <p className="text-sm text-slate-600">{company.bankName}</p>
              <p className="text-sm text-slate-600">{company.bankAccount}</p>
              {company.taxId && <p className="text-xs text-slate-400 mt-2">Tax ID: {company.taxId}</p>}
            </div>
            
            {invoice.signature ? (
              <div className="text-center">
                <img src={invoice.signature} alt="Signature" className="h-16 object-contain mx-auto mb-2" />
                <div className="w-40 border-t border-yellow-400 mx-auto"></div>
                <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest">Authorized Signature</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-40 border-t border-yellow-400 mx-auto"></div>
                <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest">Authorized Signature</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 8. Simple Small Business Template - Soft blue/green, printer-friendly
  return (
    <div ref={ref} className="bg-white text-slate-800 w-[210mm] min-h-[297mm] mx-auto shadow-2xl print:shadow-none p-12">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-slate-100">
        <div>
          {company.logo && <img src={company.logo} alt="Logo" className="h-14 mb-3 object-contain" />}
          <h1 className="text-2xl font-bold text-slate-800">{company.companyName}</h1>
          <div className="text-sm text-slate-500 mt-1 space-y-0.5">
            <p>{company.address}</p>
            <p>{company.phone} | {company.email}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-bold text-emerald-600">INVOICE</h2>
          <div className="mt-3 bg-emerald-50 px-4 py-2 rounded-lg inline-block">
            <p className="text-xs text-emerald-600 font-semibold uppercase">Invoice #</p>
            <p className="font-bold text-slate-800">{invoice.invoiceNumber}</p>
          </div>
        </div>
      </div>

      {/* Invoice Details & Client */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="bg-slate-50 p-5 rounded-lg">
          <p className="text-xs font-bold text-slate-400 uppercase mb-3">Bill To</p>
          {client ? (
            <div>
              <h3 className="font-bold text-lg text-slate-800">{client.name}</h3>
              {client.company && <p className="text-slate-600">{client.company}</p>}
              <p className="text-slate-500 text-sm mt-1">{client.address}</p>
              <p className="text-slate-500 text-sm">{client.email}</p>
              <p className="text-slate-500 text-sm">{client.phone}</p>
            </div>
          ) : (
            <p className="text-slate-400 italic">No client selected</p>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-blue-50 px-4 py-3 rounded-lg">
            <span className="text-sm text-slate-500">Invoice Date</span>
            <span className="font-semibold text-slate-800">{formatDate(invoice.date)}</span>
          </div>
          <div className="flex justify-between items-center bg-amber-50 px-4 py-3 rounded-lg">
            <span className="text-sm text-slate-500">Due Date</span>
            <span className="font-semibold text-slate-800">{formatDate(invoice.dueDate)}</span>
          </div>
          <div className="flex justify-between items-center bg-emerald-50 px-4 py-3 rounded-lg">
            <span className="text-sm text-slate-500">Amount Due</span>
            <span className="font-bold text-emerald-600">{formatCurrency(invoice.grandTotal, currency)}</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="bg-slate-800 text-white">
            <th className="py-3 px-4 text-left rounded-tl-lg">Description</th>
            <th className="py-3 px-4 text-center">Qty</th>
            <th className="py-3 px-4 text-right">Price</th>
            <th className="py-3 px-4 text-right rounded-tr-lg">Total</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {invoice.items.map((item, index) => (
            <tr key={item.id || index} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-4">
                <p className="font-medium text-slate-800">{item.name}</p>
                {item.description && <p className="text-xs text-slate-400">{item.description}</p>}
              </td>
              <td className="py-3 px-4 text-center">{item.quantity}</td>
              <td className="py-3 px-4 text-right">{formatCurrency(item.price, currency)}</td>
              <td className="py-3 px-4 text-right font-bold text-slate-800">
                {formatCurrency(item.price * item.quantity, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Section */}
      <div className="flex justify-end mb-8">
        <div className="w-80 space-y-2">
          <div className="flex justify-between text-sm text-slate-600 px-4">
            <span>Subtotal</span>
            <span>{formatCurrency(invoice.subtotal, currency)}</span>
          </div>
          {company.taxEnabled && invoice.taxTotal > 0 && (
            <div className="flex justify-between text-sm text-slate-600 px-4">
              <span>Tax ({company.defaultVat}%)</span>
              <span>{formatCurrency(invoice.taxTotal, currency)}</span>
            </div>
          )}
          {company.discountEnabled && invoice.discountValue > 0 && (
            <div className="flex justify-between text-sm text-green-600 px-4">
              <span>Discount</span>
              <span>-{formatCurrency(invoice.discountType === 'percentage' 
                ? (invoice.subtotal * invoice.discountValue / 100) 
                : invoice.discountValue, currency)}</span>
            </div>
          )}
          <div className="flex justify-between items-center bg-emerald-600 text-white px-4 py-3 rounded-lg mt-3">
            <span className="font-semibold">Grand Total</span>
            <span className="text-2xl font-bold">{formatCurrency(invoice.grandTotal, currency)}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods & Notes */}
      <div className="grid grid-cols-2 gap-8 mt-8 pt-6 border-t border-slate-200">
        <div>
          <p className="font-bold text-slate-800 mb-3">Payment Methods</p>
          <div className="bg-slate-50 p-4 rounded-lg text-sm">
            <p className="text-slate-600"><span className="font-medium">Bank Transfer:</span></p>
            <p className="text-slate-600">{company.bankName}</p>
            <p className="text-slate-600">{company.bankAccount}</p>
            {company.taxId && (
              <p className="text-slate-500 text-xs mt-2">Tax ID: {company.taxId}</p>
            )}
          </div>
        </div>
        <div>
          <p className="font-bold text-slate-800 mb-3">Notes</p>
          <div className="bg-amber-50 p-4 rounded-lg text-sm text-slate-600 min-h-[80px]">
            {invoice.notes || "Thank you for your business! Payment is due within the specified terms."}
          </div>
        </div>
      </div>

      {/* Signature */}
      {invoice.signature && (
        <div className="mt-8 flex justify-end">
          <div className="text-center">
            <img src={invoice.signature} alt="Signature" className="h-14 object-contain mx-auto mb-2" />
            <div className="w-32 border-t border-slate-300 mx-auto"></div>
            <p className="text-xs text-slate-400 mt-1">Authorized Signature</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-slate-200 text-center text-sm text-slate-400">
        <p>This invoice was generated by {company.companyName}</p>
      </div>
    </div>
  );
});

InvoicePDF.displayName = "InvoicePDF";
export default InvoicePDF;
