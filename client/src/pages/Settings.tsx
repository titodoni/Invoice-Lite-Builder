import { useCompanyProfile } from "@/lib/storage";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companyProfileSchema, type CompanyProfile } from "@/lib/schema";
import { Building, Save, Upload, X } from "lucide-react";
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
    toast({ title: "Tersimpan", description: "Pengaturan berhasil diperbarui." });
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

  const removeLogo = () => {
    setLogoPreview(undefined);
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      {/* Mobile Header */}
      <div className="md:hidden">
        <h1 className="text-xl font-bold font-display">Pengaturan</h1>
        <p className="text-sm text-muted-foreground">Profil perusahaan</p>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <h2 className="text-2xl font-bold font-display">Pengaturan</h2>
        <p className="text-muted-foreground text-sm">Kelola detail perusahaan dan pengaturan.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
        {/* Company Profile */}
        <Card>
          <CardHeader className="p-4 md:p-6 pb-2">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Building className="w-4 h-4 md:w-5 md:h-5 text-primary" /> 
              Profil Perusahaan
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Detail yang muncul pada tagihan</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Logo Upload */}
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 md:w-24 md:h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50 overflow-hidden cursor-pointer hover:bg-muted transition-colors relative group shrink-0"
                onClick={() => fileInputRef.current?.click()}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <Upload className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground opacity-50" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] md:text-xs text-white font-medium">Ubah</p>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">Logo Perusahaan</h4>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">PNG/JPG, maks 1MB</p>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                <div className="flex gap-2 mt-2">
                  <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => fileInputRef.current?.click()}>
                    Unggah
                  </Button>
                  {logoPreview && (
                    <Button type="button" variant="ghost" size="sm" className="h-8 text-xs text-red-600" onClick={removeLogo}>
                      <X className="w-3 h-3 mr-1" /> Hapus
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs md:text-sm">Nama Perusahaan *</Label>
                <Input {...form.register("companyName")} className="h-10" />
                {form.formState.errors.companyName && (
                  <p className="text-red-500 text-xs">{form.formState.errors.companyName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs md:text-sm">Email</Label>
                <Input {...form.register("email")} type="email" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs md:text-sm">Telepon</Label>
                <Input {...form.register("phone")} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs md:text-sm">NPWP/Tax ID</Label>
                <Input {...form.register("taxId")} className="h-10" />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label className="text-xs md:text-sm">Alamat</Label>
                <Input {...form.register("address")} className="h-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features & Tax */}
        <Card>
          <CardHeader className="p-4 md:p-6 pb-2">
            <CardTitle className="text-base md:text-lg">Fitur & Pajak</CardTitle>
            <CardDescription className="text-xs md:text-sm">Aktifkan fitur tambahan</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Pajak (PPN)</Label>
                <p className="text-xs text-muted-foreground">Aktifkan perhitungan pajak</p>
              </div>
              <Switch 
                checked={form.watch("taxEnabled")} 
                onCheckedChange={(val) => form.setValue("taxEnabled", val)} 
              />
            </div>
            
            {form.watch("taxEnabled") && (
              <div className="space-y-1.5 pt-2">
                <Label className="text-xs">PPN Default (%)</Label>
                <Input 
                  type="number" 
                  min="0" 
                  step="0.1" 
                  className="h-10 w-32"
                  {...form.register("defaultVat", { valueAsNumber: true })} 
                />
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Diskon</Label>
                <p className="text-xs text-muted-foreground">Aktifkan fitur diskon</p>
              </div>
              <Switch 
                checked={form.watch("discountEnabled")} 
                onCheckedChange={(val) => form.setValue("discountEnabled", val)} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Financial Settings */}
        <Card>
          <CardHeader className="p-4 md:p-6 pb-2">
            <CardTitle className="text-base md:text-lg">Pengaturan Bank</CardTitle>
            <CardDescription className="text-xs md:text-sm">Untuk instruksi pembayaran</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs md:text-sm">Nama Bank</Label>
                <Input {...form.register("bankName")} className="h-10" placeholder="Contoh: BCA, Mandiri" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs md:text-sm">Nomor Rekening</Label>
                <Input {...form.register("bankAccount")} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs md:text-sm">Mata Uang Default</Label>
                <Input {...form.register("currency")} className="h-10" placeholder="IDR" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button - Desktop */}
        <div className="hidden md:flex justify-end">
          <Button type="submit" className="shadow-lg shadow-primary/20">
            <Save className="w-4 h-4 mr-2" /> Simpan Perubahan
          </Button>
        </div>

        {/* Mobile Sticky Button */}
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 bg-background border-t px-4 py-3">
          <Button type="submit" className="w-full">
            <Save className="w-4 h-4 mr-2" /> Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
}
