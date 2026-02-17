import { forwardRef } from "react";
import { Invoice, CompanyProfile, Client } from "@shared/schema";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

interface InvoicePDFProps {
  invoice: Invoice;
  company: CompanyProfile;
  client: Client | undefined;
  template?: "minimal" | "corporate" | "modern";
}

const InvoicePDF = forwardRef<HTMLDivElement, InvoicePDFProps>(({ 
  invoice, 
  company, 
  client,
  template = "modern" 
}, ref) => {
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
});

InvoicePDF.displayName = "InvoicePDF";
export default InvoicePDF;
