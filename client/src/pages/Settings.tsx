import { useCompanyProfile } from "@/lib/storage";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companyProfileSchema, type CompanyProfile } from "@shared/schema";
import { 
  Building, 
  Save, 
  Upload,
  Percent,
  Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useRef, useState } from "react";

export default function Settings() {
  const { profile, updateProfile } = useCompanyProfile();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(profile.logo);

  const form = useForm<CompanyProfile>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: profile
  });

  const onSubmit = (data: CompanyProfile) => {
    updateProfile({ ...data, logo: logoPreview });
    toast({ title: "Settings saved", description: "Company profile updated successfully." });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-display">Pengaturan</h2>
        <p className="text-muted-foreground">Kelola detail perusahaan dan pengaturan awal.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <Building className="w-5 h-5 text-primary" /> Profil Perusahaan
            </CardTitle>
            <CardDescription>Detail ini akan muncul pada tagihan Anda.</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="p-6 space-y-6">
             {/* Logo Upload */}
             <div className="flex items-center gap-6">
                <div 
                  className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50 overflow-hidden cursor-pointer hover:bg-muted transition-colors relative group"
                  onClick={() => fileInputRef.current?.click()}
                >
                   {logoPreview ? (
                      <img src={logoPreview} alt="Logo Perusahaan" className="w-full h-full object-contain p-2" />
                   ) : (
                      <Upload className="w-8 h-8 text-muted-foreground opacity-50" />
                   )}
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white font-medium">Ubah</p>
                   </div>
                </div>
                <div>
                   <h4 className="font-medium text-sm">Logo Perusahaan</h4>
                   <p className="text-xs text-muted-foreground mt-1 mb-2">Unggah logo persegi (PNG/JPG). Maks 1MB.</p>
                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                   <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      Unggah Logo
                   </Button>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <Label>Nama Perusahaan</Label>
                   <Input {...form.register("companyName")} />
                   {form.formState.errors.companyName && <p className="text-red-500 text-xs">{form.formState.errors.companyName.message}</p>}
                </div>
                <div className="space-y-2">
                   <Label>Alamat Email</Label>
                   <Input {...form.register("email")} />
                </div>
                <div className="space-y-2">
                   <Label>Nomor Telepon</Label>
                   <Input {...form.register("phone")} />
                </div>
                <div className="space-y-2">
                   <Label>ID Pajak / NPWP</Label>
                   <Input {...form.register("taxId")} />
                </div>
                <div className="col-span-full space-y-2">
                   <Label>Alamat</Label>
                   <Input {...form.register("address")} />
                </div>
             </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fitur & Pajak</CardTitle>
            <CardDescription>Aktifkan atau nonaktifkan fitur tambahan.</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="p-6 space-y-6">
             <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                   <Label className="text-base">Pajak (PPN)</Label>
                   <p className="text-sm text-muted-foreground">Aktifkan perhitungan pajak pada tagihan.</p>
                </div>
                <Switch 
                  checked={form.watch("taxEnabled")} 
                  onCheckedChange={(val) => form.setValue("taxEnabled", val)} 
                />
             </div>
             
             {form.watch("taxEnabled") && (
                <div className="space-y-2 pt-2">
                   <Label>PPN Default (%)</Label>
                   <Input type="number" min="0" step="0.1" {...form.register("defaultVat", { valueAsNumber: true })} />
                </div>
             )}

             <Separator />

             <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                   <Label className="text-base">Diskon</Label>
                   <p className="text-sm text-muted-foreground">Aktifkan fitur diskon pada tagihan.</p>
                </div>
                <Switch 
                  checked={form.watch("discountEnabled")} 
                  onCheckedChange={(val) => form.setValue("discountEnabled", val)} 
                />
             </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pengaturan Keuangan</CardTitle>
            <CardDescription>Pengaturan awal untuk tagihan baru.</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <Label>Nama Bank</Label>
                <Input {...form.register("bankName")} />
             </div>
             <div className="space-y-2">
                <Label>Nomor Rekening</Label>
                <Input {...form.register("bankAccount")} />
             </div>
             <div className="space-y-2">
                <Label>Kode Mata Uang</Label>
                <Input {...form.register("currency")} placeholder="IDR" />
             </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
           <Button type="submit" size="lg" className="shadow-lg shadow-primary/20">
              <Save className="w-4 h-4 mr-2" /> Simpan Perubahan
           </Button>
        </div>
      </form>
    </div>
  );
}
