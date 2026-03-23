import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SGFInput } from '@/components/sgf/SGFInput';
import { SGFSelect } from '@/components/sgf/SGFSelect';
import { SGFButton } from '@/components/sgf/SGFButton';
import { Loader2, Save, Fuel, Calendar, Car, User, Receipt, DollarSign, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

const refuelingSchema = z.object({
    vehicleId: z.string().min(1, 'Veículo é obrigatório'),
    driverId: z.string().min(1, 'Motorista é obrigatório'),
    date: z.string().min(1, 'Data é obrigatória'),
    fuelType: z.enum(['gasolina', 'etanol', 'diesel', 'gnv']),
    liters: z.coerce.number().min(0.1, 'Mínimo 0.1L'),
    pricePerLiter: z.coerce.number().min(0.01, 'Preço é obrigatório'),
    totalValue: z.coerce.number().min(0.01, 'Valor total é obrigatório'),
    odometer: z.coerce.number().min(0, 'Odômetro é obrigatório'),
});

type RefuelingFormData = z.infer<typeof refuelingSchema>;
type RefuelingFormInput = z.input<typeof refuelingSchema>;

interface NewRefuelingFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

// Mock data
const mockVehicles = [
    { value: '1', label: 'ABC-1234 - Fiat Strada' },
    { value: '2', label: 'XYZ-5678 - Chevrolet Spin' },
];

const mockDrivers = [
    { value: '1', label: 'Maria Santos' },
    { value: '2', label: 'João Silva' },
];

export function NewRefuelingForm({ onSuccess, onCancel }: NewRefuelingFormProps) {
    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<RefuelingFormInput, unknown, RefuelingFormData>({
        resolver: zodResolver(refuelingSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            fuelType: 'gasolina',
            liters: 0,
            pricePerLiter: 0,
            totalValue: 0,
            odometer: 0,
        },
    });

    const liters = Number(watch('liters') || 0);
    const pricePerLiter = Number(watch('pricePerLiter') || 0);

    // Auto-calculate total or price per liter
    React.useEffect(() => {
        if (liters && pricePerLiter) {
            setValue('totalValue', Number((liters * pricePerLiter).toFixed(2)));
        }
    }, [liters, pricePerLiter, setValue]);

    const onSubmit = async (data: RefuelingFormData) => {
        try {
            console.log('Refueling data:', data);
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success('Abastecimento registrado com sucesso!');
            onSuccess();
        } catch (error) {
            toast.error('Erro ao registrar abastecimento.');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                    name="vehicleId"
                    control={control}
                    render={({ field }) => (
                        <SGFSelect
                            label="Veículo"
                            options={mockVehicles}
                            value={field.value}
                            onChange={field.onChange}
                            error={errors.vehicleId?.message}
                            placeholder="Selecione o veículo..."
                            fullWidth
                            icon={Car}
                        />
                    )}
                />

                <Controller
                    name="driverId"
                    control={control}
                    render={({ field }) => (
                        <SGFSelect
                            label="Motorista"
                            options={mockDrivers}
                            value={field.value}
                            onChange={field.onChange}
                            error={errors.driverId?.message}
                            placeholder="Selecione o motorista..."
                            fullWidth
                            icon={User}
                        />
                    )}
                />

                <SGFInput
                    label="Data do Abastecimento"
                    type="date"
                    {...register('date')}
                    error={errors.date?.message}
                    fullWidth
                    icon={Calendar}
                />

                <Controller
                    name="fuelType"
                    control={control}
                    render={({ field }) => (
                        <SGFSelect
                            label="Combustível"
                            options={[
                                { value: 'gasolina', label: 'Gasolina' },
                                { value: 'etanol', label: 'Etanol' },
                                { value: 'diesel', label: 'Diesel' },
                                { value: 'gnv', label: 'GNV' },
                            ]}
                            value={field.value}
                            onChange={field.onChange}
                            error={errors.fuelType?.message}
                            fullWidth
                            icon={Fuel}
                        />
                    )}
                />

                <SGFInput
                    label="Odômetro Atual (km)"
                    type="number"
                    placeholder="Ex: 45230"
                    {...register('odometer')}
                    error={errors.odometer?.message}
                    fullWidth
                    icon={ArrowUpRight}
                />

                <div className="grid grid-cols-2 gap-4">
                    <SGFInput
                        label="Litros"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register('liters')}
                        error={errors.liters?.message}
                        fullWidth
                    />
                    <SGFInput
                        label="Preço por Litro"
                        type="number"
                        step="0.001"
                        placeholder="0.000"
                        {...register('pricePerLiter')}
                        error={errors.pricePerLiter?.message}
                        fullWidth
                    />
                </div>

                <div className="md:col-span-2">
                    <SGFInput
                        label="Valor Total (R$)"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register('totalValue')}
                        error={errors.totalValue?.message}
                        fullWidth
                        icon={DollarSign}
                    />
                </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                <Receipt className="h-5 w-5 text-slate-400" />
                <p className="text-xs text-slate-500 font-medium">A foto do comprovante poderá ser anexada após o registro.</p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <SGFButton type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                    Cancelar
                </SGFButton>
                <SGFButton type="submit" icon={isSubmitting ? Loader2 : Save} disabled={isSubmitting}>
                    {isSubmitting ? 'Registrando...' : 'Registrar Abastecimento'}
                </SGFButton>
            </div>
        </form>
    );
}
