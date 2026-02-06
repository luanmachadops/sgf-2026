import React, { useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SGFInput } from '@/components/sgf/SGFInput';
import { SGFSelect } from '@/components/sgf/SGFSelect';
import { SGFButton } from '@/components/sgf/SGFButton';
import { Loader2, Save, Camera, Upload, User } from 'lucide-react';
import { driversApi } from '@/lib/api';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { resizeAndConvertToWebP, isImageFile } from '@/lib/imageUtils';

const driverSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    cpf: z.string().min(11, 'CPF inválido').max(14, 'CPF inválido'),
    phone: z.string().min(10, 'Telefone inválido'),
    email: z.string().email('E-mail inválido'),
    licenseNumber: z.string().min(1, 'Número da CNH é obrigatório'),
    licenseCategory: z.string().min(1, 'Categoria é obrigatória'),
    licenseExpiry: z.string().min(1, 'Validade da CNH é obrigatória'),
    department: z.string().min(1, 'Secretaria é obrigatória'),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
});

type DriverFormData = z.infer<typeof driverSchema>;

interface NewDriverFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function NewDriverForm({ onSuccess, onCancel }: NewDriverFormProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting: isFormSubmitting },
    } = useForm({
        resolver: zodResolver(driverSchema),
        defaultValues: {
            status: 'ACTIVE',
        },
    });

    const isSubmitting = isFormSubmitting || isUploading;

    const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!isImageFile(file)) {
            toast.error('Por favor, selecione um arquivo de imagem válido');
            return;
        }

        setSelectedFile(file);

        // create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const onSubmit = async (data: DriverFormData) => {
        try {
            // 1. Create driver
            const createdDriver = await driversApi.create(data);
            const driverId = createdDriver.id;

            // 2. Upload photo if selected
            if (selectedFile && driverId) {
                setIsUploading(true);
                try {
                    toast.info('Fazendo upload da foto...');
                    const optimizedBlob = await resizeAndConvertToWebP(selectedFile, 1000);
                    const fileName = `driver-${driverId}-${Date.now()}.webp`;

                    const { error: uploadError } = await supabase.storage
                        .from('driver-photos')
                        .upload(fileName, optimizedBlob, {
                            contentType: 'image/webp',
                            upsert: true,
                        });

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('driver-photos')
                        .getPublicUrl(fileName);

                    await driversApi.updatePhoto(driverId, publicUrl);
                    toast.success('Foto enviada com sucesso!');

                } catch (photoError) {
                    console.error('Photo upload failed:', photoError);
                    toast.warning('Motorista cadastrado, mas houve erro ao enviar a foto.');
                } finally {
                    setIsUploading(false);
                }
            }

            toast.success('Motorista cadastrado com sucesso!');
            onSuccess();
        } catch (error: any) {
            console.error('Error creating driver:', error);
            toast.error('Erro ao cadastrar motorista. Tente novamente.');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-[300px_1fr] gap-8">
                {/* Left Column - Photo Upload */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-700">
                        Foto do Motorista
                    </label>
                    <div
                        className={`
                            relative aspect-square w-full rounded-2xl border-2 border-dashed
                            flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all
                            ${photoPreview
                                ? 'border-emerald-500/50 bg-emerald-50/30'
                                : 'border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30'
                            }
                        `}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {photoPreview ? (
                            <>
                                <img
                                    src={photoPreview}
                                    alt="Preview"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                                    <User size={24} />
                                </div>
                                <p className="text-sm font-medium text-slate-700">
                                    Clique para enviar
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    JPG, PNG ou WebP
                                </p>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoSelect}
                        />
                    </div>
                </div>

                {/* Right Column - Form Fields */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <SGFInput
                            label="Nome Completo"
                            placeholder="João da Silva"
                            {...register('name')}
                            error={errors.name?.message}
                            fullWidth
                        />
                        <SGFInput
                            label="CPF"
                            placeholder="000.000.000-00"
                            {...register('cpf')}
                            error={errors.cpf?.message}
                            fullWidth
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <SGFInput
                            label="Telefone"
                            placeholder="(00) 00000-0000"
                            {...register('phone')}
                            error={errors.phone?.message}
                            fullWidth
                        />
                        <SGFInput
                            label="E-mail"
                            placeholder="email@exemplo.com"
                            type="email"
                            {...register('email')}
                            error={errors.email?.message}
                            fullWidth
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <SGFInput
                            label="Número da CNH"
                            placeholder="12345678900"
                            {...register('licenseNumber')}
                            error={errors.licenseNumber?.message}
                            fullWidth
                        />
                        <Controller
                            name="licenseCategory"
                            control={control}
                            render={({ field }) => (
                                <SGFSelect
                                    label="Categoria"
                                    options={[
                                        { value: 'A', label: 'A' },
                                        { value: 'B', label: 'B' },
                                        { value: 'C', label: 'C' },
                                        { value: 'D', label: 'D' },
                                        { value: 'E', label: 'E' },
                                        { value: 'AB', label: 'AB' },
                                        { value: 'AC', label: 'AC' },
                                        { value: 'AD', label: 'AD' },
                                        { value: 'AE', label: 'AE' },
                                    ]}
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.licenseCategory?.message}
                                    fullWidth
                                />
                            )}
                        />
                        <SGFInput
                            label="Validade CNH"
                            type="date"
                            {...register('licenseExpiry')}
                            error={errors.licenseExpiry?.message}
                            fullWidth
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Controller
                            name="department"
                            control={control}
                            render={({ field }) => (
                                <SGFSelect
                                    label="Secretaria"
                                    options={[
                                        { value: 'Obras', label: 'Obras' },
                                        { value: 'Saúde', label: 'Saúde' },
                                        { value: 'Educação', label: 'Educação' },
                                        { value: 'Transporte', label: 'Transporte' },
                                        { value: 'Administração', label: 'Administração' },
                                    ]}
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.department?.message}
                                    fullWidth
                                />
                            )}
                        />

                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <SGFSelect
                                    label="Status"
                                    options={[
                                        { value: 'ACTIVE', label: 'Ativo' },
                                        { value: 'INACTIVE', label: 'Inativo' },
                                        { value: 'SUSPENDED', label: 'Suspenso' },
                                    ]}
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.status?.message}
                                    fullWidth
                                />
                            )}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <SGFButton type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                    Cancelar
                </SGFButton>
                <SGFButton type="submit" icon={isSubmitting ? Loader2 : Save} disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : 'Cadastrar Motorista'}
                </SGFButton>
            </div>
        </form>
    );
}
