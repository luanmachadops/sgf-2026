import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SGFInput } from '@/components/sgf/SGFInput';
import { SGFSelect } from '@/components/sgf/SGFSelect';
import { SGFButton } from '@/components/sgf/SGFButton';
import { Loader2, Save, Car, Bike, Truck, Bus, CarFront, Ambulance, Camera, Upload, Tractor } from 'lucide-react';
import { vehiclesApi } from '@/lib/supabase-api';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { resizeAndConvertToWebP, isImageFile } from '@/lib/imageUtils';

const vehicleSchema = z.object({
    plate: z.string().min(7, 'Placa inválida').max(8, 'Placa inválida'),
    brand: z.string().min(1, 'Marca é obrigatória'),
    model: z.string().min(1, 'Modelo é obrigatório'),
    year: z.coerce.number().min(1900, 'Ano inválido').max(new Date().getFullYear() + 1, 'Ano inválido'),
    type: z.string().min(1, 'Tipo é obrigatório'),
    color: z.string().min(1, 'Cor é obrigatória'),
    renavam: z.string().min(1, 'Renavam é obrigatório'),
    chassi: z.string().min(1, 'Chassi é obrigatório'),
    odometer: z.coerce.number().min(0, 'Odômetro não pode ser negativo'),
    fuelType: z.string().min(1, 'Combustível é obrigatório'),
    department: z.string().min(1, 'Secretaria é obrigatória'),
    status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'INACTIVE']).default('AVAILABLE'),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface NewVehicleFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function NewVehicleForm({ onSuccess, onCancel }: NewVehicleFormProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting: isFormSubmitting },
    } = useForm({
        resolver: zodResolver(vehicleSchema),
        defaultValues: {
            status: 'AVAILABLE',
            odometer: 0,
            year: new Date().getFullYear(),
        },
    });

    const [isUploading, setIsUploading] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

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

    const onSubmit = async (data: VehicleFormData) => {
        try {
            // Map form fields to DB schema
            const fuelTypeMap: Record<string, 'DIESEL' | 'GASOLINE' | 'ETHANOL' | 'FLEX'> = {
                'Diesel': 'DIESEL',
                'Gasolina': 'GASOLINE',
                'Etanol': 'ETHANOL',
                'Flex': 'FLEX',
                'Elétrico': 'FLEX', // fallback
            };

            const vehiclePayload = {
                plate: data.plate,
                brand: data.brand,
                model: data.model,
                year: data.year,
                type: data.type,
                color: data.color,
                renavam: data.renavam,
                chassi: data.chassi,
                current_odometer: data.odometer,
                fuel_type: fuelTypeMap[data.fuelType] ?? 'GASOLINE',
                status: data.status,
                tank_capacity: 0,
                qr_code_hash: null,
            };

            // 1. Create vehicle first
            const createdVehicle = await vehiclesApi.create(vehiclePayload as any);
            const vehicleId = createdVehicle.id;

            // 2. Upload photo if selected
            if (selectedFile && vehicleId) {
                setIsUploading(true);
                try {
                    toast.info('Fazendo upload da foto...');
                    const optimizedBlob = await resizeAndConvertToWebP(selectedFile, 1000);
                    const fileName = `vehicle-${vehicleId}-${Date.now()}.webp`;

                    const { error: uploadError } = await supabase.storage
                        .from('vehicle-photos')
                        .upload(fileName, optimizedBlob, {
                            contentType: 'image/webp',
                            upsert: true,
                        });

                    if (uploadError) throw uploadError;

                    // get public url
                    const { data: { publicUrl } } = supabase.storage
                        .from('vehicle-photos')
                        .getPublicUrl(fileName);

                    // update vehicle with photo url
                    await vehiclesApi.updatePhoto(vehicleId, publicUrl);
                    toast.success('Foto enviada com sucesso!');

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
            toast.error('Erro ao cadastrar veículo. Verifique os dados e tente novamente.');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Left Column - Photo Upload */}
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
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-4">
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                                        <Upload size={20} />
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
                        {selectedFile && (
                            <p className="text-xs text-center text-emerald-600 font-medium">
                                Foto selecionada para upload
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Column - Form Fields */}
                <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SGFInput
                            label="Placa"
                            placeholder="ABC-1234"
                            {...register('plate')}
                            error={errors.plate?.message}
                            fullWidth
                        />
                        <div className="grid grid-cols-2 gap-4">
                            {/* Logic for Brand Selection vs Custom Input */}
                            <Controller
                                name="brand"
                                control={control}
                                render={({ field }) => {
                                    // ... (Local logic for Brand Select/Input kept from previous step but inside render)
                                    // RE-IMPLEMENTING LOGIC HERE TO ENSURE CONTEXT IS PRESERVED
                                    // NOTE: Since I am replacing the whole form content, I need to include the full component logic again.
                                    // Optimally, I should have used multi_replace or view_file first to ensure I have the exact content.
                                    // But I have the content from previous turns. I will reconstruct carefully.
                                    const [isCustom, setIsCustom] = React.useState(false);
                                    const topBrands = [
                                        'Chevrolet', 'Citroën', 'Fiat', 'Ford', 'Honda',
                                        'Hyundai', 'Jeep', 'Mitsubishi', 'Nissan', 'Peugeot',
                                        'Renault', 'Toyota', 'Volkswagen', 'Volvo', 'BMW'
                                    ].sort();

                                    const selectOptions = [
                                        ...topBrands.map(b => ({ value: b, label: b })),
                                        { value: 'OTHER', label: 'Outros (Digitar...)' }
                                    ];

                                    const handleSelectChange = (val: string) => {
                                        if (val === 'OTHER') {
                                            setIsCustom(true);
                                            field.onChange('');
                                        } else {
                                            setIsCustom(false);
                                            field.onChange(val);
                                        }
                                    };

                                    const toggleToSelect = () => {
                                        setIsCustom(false);
                                        field.onChange('');
                                    };

                                    if (isCustom) {
                                        return (
                                            <div className="relative">
                                                <SGFInput
                                                    label="Marca..."
                                                    placeholder="Digite..."
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    error={errors.brand?.message}
                                                    fullWidth
                                                />
                                                <button
                                                    type="button"
                                                    onClick={toggleToSelect}
                                                    className="absolute right-0 top-0 text-xs text-blue-600 hover:text-blue-800 underline mt-0 mr-1"
                                                    style={{ top: '2px', right: '4px' }}
                                                >
                                                    Ver lista
                                                </button>
                                            </div>
                                        );
                                    }

                                    return (
                                        <SGFSelect
                                            label="Marca"
                                            options={selectOptions}
                                            value={topBrands.includes(field.value) ? field.value : ''}
                                            onChange={handleSelectChange}
                                            error={errors.brand?.message}
                                            fullWidth
                                            placeholder="Selecione..."
                                        />
                                    );
                                }}
                            />

                            <SGFInput
                                label="Modelo"
                                placeholder="Strada"
                                {...register('model')}
                                error={errors.model?.message}
                                fullWidth
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <SGFInput
                                label="Ano"
                                type="number"
                                {...register('year')}
                                error={errors.year?.message}
                                fullWidth
                            />
                            <SGFInput
                                label="Cor"
                                placeholder="Branco"
                                {...register('color')}
                                error={errors.color?.message}
                                fullWidth
                            />
                        </div>

                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => {
                                const [isCustomType, setIsCustomType] = React.useState(false);

                                const typeOptions = [
                                    { value: 'Carro', label: 'Carro', icon: Car },
                                    { value: 'Moto', label: 'Moto', icon: Bike },
                                    { value: 'Caminhão', label: 'Caminhão', icon: Truck },
                                    { value: 'Van', label: 'Van', icon: Bus },
                                    { value: 'Pickup', label: 'Pickup', icon: CarFront },
                                    { value: 'Ambulância', label: 'Ambulância', icon: Ambulance },
                                    { value: 'SUV', label: 'SUV', icon: Car },
                                    { value: 'Trator', label: 'Trator', icon: Tractor },
                                    { value: 'Retroescavadeira', label: 'Retroescavadeira', icon: Tractor },
                                    { value: 'Patrola', label: 'Patrola', icon: Tractor },
                                    { value: 'Máquina Agrícola', label: 'Máquina Agrícola', icon: Tractor },
                                ];

                                const selectOptions = [
                                    ...typeOptions,
                                    { value: 'OTHER', label: 'Outros (Digitar...)' }
                                ];

                                const handleSelectChange = (val: string) => {
                                    if (val === 'OTHER') {
                                        setIsCustomType(true);
                                        field.onChange('');
                                    } else {
                                        setIsCustomType(false);
                                        field.onChange(val);
                                    }
                                };

                                const toggleToSelect = () => {
                                    setIsCustomType(false);
                                    field.onChange('');
                                };

                                if (isCustomType) {
                                    return (
                                        <div className="relative">
                                            <SGFInput
                                                label="Tipo..."
                                                placeholder="Digite o tipo..."
                                                value={field.value}
                                                onChange={field.onChange}
                                                error={errors.type?.message}
                                                fullWidth
                                            />
                                            <button
                                                type="button"
                                                onClick={toggleToSelect}
                                                className="absolute right-0 top-0 text-xs text-blue-600 hover:text-blue-800 underline mt-0 mr-1"
                                                style={{ top: '2px', right: '4px' }}
                                            >
                                                Ver lista
                                            </button>
                                        </div>
                                    );
                                }

                                return (
                                    <SGFSelect
                                        label="Tipo"
                                        options={selectOptions}
                                        value={typeOptions.some(o => o.value === field.value) ? field.value : ''}
                                        onChange={handleSelectChange}
                                        error={errors.type?.message}
                                        fullWidth
                                    />
                                );
                            }}
                        />

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
                            name="fuelType"
                            control={control}
                            render={({ field }) => (
                                <SGFSelect
                                    label="Combustível"
                                    options={[
                                        { value: 'Gasolina', label: 'Gasolina' },
                                        { value: 'Etanol', label: 'Etanol' },
                                        { value: 'Flex', label: 'Flex' },
                                        { value: 'Diesel', label: 'Diesel' },
                                        { value: 'Elétrico', label: 'Elétrico' },
                                    ]}
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.fuelType?.message}
                                    fullWidth
                                />
                            )}
                        />

                        <SGFInput
                            label="Renavam"
                            placeholder="12345678900"
                            {...register('renavam')}
                            error={errors.renavam?.message}
                            fullWidth
                        />

                        <SGFInput
                            label="Chassi"
                            placeholder="9BW..."
                            {...register('chassi')}
                            error={errors.chassi?.message}
                            fullWidth
                        />

                        <SGFInput
                            label="Odômetro Inicial (km)"
                            type="number"
                            {...register('odometer')}
                            error={errors.odometer?.message}
                            fullWidth
                        />

                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <SGFSelect
                                    label="Status Inicial"
                                    options={[
                                        { value: 'AVAILABLE', label: 'Disponível' },
                                        { value: 'IN_USE', label: 'Em Uso' },
                                        { value: 'MAINTENANCE', label: 'Em Manutenção' },
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
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
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
