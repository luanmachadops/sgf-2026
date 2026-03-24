import React, { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, Camera, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { SGFButton } from '@/components/sgf/SGFButton';
import { SGFInput } from '@/components/sgf/SGFInput';
import { SGFSelect } from '@/components/sgf/SGFSelect';
import { departmentsApi, vehiclesApi } from '@/lib/supabase-api';
import { supabase } from '@/lib/supabase';
import { resizeAndConvertToWebP, isImageFile } from '@/lib/imageUtils';
import type { TablesInsert } from '@/types/database.types';
import { useAuth } from '@/contexts/AuthContext';

const vehicleSchema = z.object({
    plate: z.string().min(7, 'Placa inválida').max(8, 'Placa inválida'),
    brand: z.string().min(1, 'Marca é obrigatória'),
    model: z.string().min(1, 'Modelo é obrigatório'),
    year: z.coerce.number().min(1900, 'Ano inválido').max(new Date().getFullYear() + 1, 'Ano inválido'),
    fuelType: z.enum(['DIESEL', 'GASOLINE', 'ETHANOL', 'FLEX'], {
        error: 'Combustível é obrigatório',
    }),
    tankCapacity: z.coerce.number().min(1, 'Capacidade do tanque é obrigatória'),
    currentOdometer: z.coerce.number().min(0, 'Odômetro não pode ser negativo'),
    departmentId: z.string().uuid('Secretaria é obrigatória'),
    status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'INACTIVE']).default('AVAILABLE'),
});

type VehicleFormInput = z.input<typeof vehicleSchema>;

interface NewVehicleFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

function generateVehicleQrHash(plate: string) {
    const normalizedPlate = plate.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    return `vehicle-${normalizedPlate}-${Date.now()}`;
}

export function NewVehicleForm({ onSuccess, onCancel }: NewVehicleFormProps) {
    const { user } = useAuth();
    const [departmentOptions, setDepartmentOptions] = useState<Array<{ value: string; label: string }>>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors, isSubmitting: isFormSubmitting },
    } = useForm<VehicleFormInput>({
        resolver: zodResolver(vehicleSchema),
        defaultValues: {
            status: 'AVAILABLE',
            currentOdometer: 0,
            year: new Date().getFullYear(),
            departmentId: user?.departmentId ?? '',
        },
    });

    useEffect(() => {
        if (user?.departmentId) {
            setValue('departmentId', user.departmentId);
        }
    }, [setValue, user?.departmentId]);

    useEffect(() => {
        let isMounted = true;

        const loadDepartments = async () => {
            try {
                const departments = await departmentsApi.getAll();
                if (!isMounted) return;

                setDepartmentOptions(
                    departments.map((department) => ({
                        value: department.id,
                        label: department.name,
                    }))
                );
            } catch (error) {
                console.error('Error loading departments:', error);
                toast.error('Não foi possível carregar as secretarias.');
            }
        };

        void loadDepartments();

        return () => {
            isMounted = false;
        };
    }, []);

    const isSubmitting = isFormSubmitting || isUploading;

    const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!isImageFile(file)) {
            toast.error('Por favor, selecione um arquivo de imagem válido');
            return;
        }

        setSelectedFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const onSubmit = async (data: VehicleFormInput) => {
        try {
            const normalizedPlate = data.plate.trim().toUpperCase();

            const vehiclePayload: TablesInsert<'vehicles'> = {
                plate: normalizedPlate,
                brand: data.brand.trim(),
                model: data.model.trim(),
                year: data.year,
                fuel_type: data.fuelType,
                tank_capacity: data.tankCapacity,
                current_odometer: data.currentOdometer,
                department_id: data.departmentId,
                status: data.status ?? 'AVAILABLE',
                qr_code_hash: generateVehicleQrHash(normalizedPlate),
            };

            const createdVehicle = await vehiclesApi.create(vehiclePayload);

            if (selectedFile) {
                setIsUploading(true);
                try {
                    const optimizedBlob = await resizeAndConvertToWebP(selectedFile, 1000);
                    const fileName = `vehicle-${createdVehicle.id}-${Date.now()}.webp`;

                    const { error: uploadError } = await supabase.storage
                        .from('vehicle-photos')
                        .upload(fileName, optimizedBlob, {
                            contentType: 'image/webp',
                            upsert: true,
                        });

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('vehicle-photos')
                        .getPublicUrl(fileName);

                    await vehiclesApi.updatePhoto(createdVehicle.id, publicUrl);
                } catch (photoError) {
                    console.error('Photo upload failed:', photoError);
                    toast.warning('Veículo criado, mas houve erro ao enviar a foto.');
                } finally {
                    setIsUploading(false);
                }
            }

            toast.success('Veículo cadastrado com sucesso!');
            onSuccess();
        } catch (error: any) {
            console.error('Error creating vehicle:', error);
            toast.error(error?.message || 'Erro ao cadastrar veículo. Verifique os dados e tente novamente.');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col gap-6 md:flex-row">
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[var(--sgf-text-primary)]">
                            Foto do Veículo
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
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Camera className="h-8 w-8 text-white" />
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-4">
                                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                        <Upload size={20} />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">Clique para enviar</p>
                                    <p className="mt-1 text-xs text-slate-500">JPG, PNG ou WebP</p>
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

                        {selectedFile && (
                            <p className="text-center text-xs font-medium text-emerald-600">
                                Foto selecionada para upload
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <SGFInput
                            label="Placa"
                            placeholder="ABC-1234"
                            {...register('plate')}
                            error={errors.plate?.message}
                            fullWidth
                        />
                        <SGFInput
                            label="Marca"
                            placeholder="Fiat"
                            {...register('brand')}
                            error={errors.brand?.message}
                            fullWidth
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <SGFInput
                            label="Modelo"
                            placeholder="Strada"
                            {...register('model')}
                            error={errors.model?.message}
                            fullWidth
                        />
                        <SGFInput
                            label="Ano"
                            type="number"
                            {...register('year')}
                            error={errors.year?.message}
                            fullWidth
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Controller
                            name="fuelType"
                            control={control}
                            render={({ field }) => (
                                <SGFSelect
                                    label="Combustível"
                                    options={[
                                        { value: 'GASOLINE', label: 'Gasolina' },
                                        { value: 'ETHANOL', label: 'Etanol' },
                                        { value: 'DIESEL', label: 'Diesel' },
                                        { value: 'FLEX', label: 'Flex' },
                                    ]}
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.fuelType?.message}
                                    placeholder="Selecione o combustível"
                                    fullWidth
                                />
                            )}
                        />

                        <SGFInput
                            label="Capacidade do tanque (L)"
                            type="number"
                            step="0.01"
                            {...register('tankCapacity')}
                            error={errors.tankCapacity?.message}
                            fullWidth
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <SGFInput
                            label="Odômetro atual"
                            type="number"
                            {...register('currentOdometer')}
                            error={errors.currentOdometer?.message}
                            fullWidth
                        />

                        <Controller
                            name="departmentId"
                            control={control}
                            render={({ field }) => (
                                <SGFSelect
                                    label="Secretaria"
                                    options={departmentOptions}
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.departmentId?.message}
                                    placeholder="Selecione a secretaria"
                                    fullWidth
                                />
                            )}
                        />
                    </div>

                    <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                            <SGFSelect
                                label="Status"
                                options={[
                                    { value: 'AVAILABLE', label: 'Disponível' },
                                    { value: 'IN_USE', label: 'Em uso' },
                                    { value: 'MAINTENANCE', label: 'Manutenção' },
                                    { value: 'INACTIVE', label: 'Inativo' },
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

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <SGFButton type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                    Cancelar
                </SGFButton>
                <SGFButton type="submit" icon={isSubmitting ? Loader2 : Save} disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : 'Cadastrar Veículo'}
                </SGFButton>
            </div>
        </form>
    );
}
