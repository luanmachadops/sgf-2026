import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SGFInput } from '@/components/sgf/SGFInput';
import { SGFSelect } from '@/components/sgf/SGFSelect';
import { SGFButton } from '@/components/sgf/SGFButton';
import { Loader2, Save, Wrench, Calendar, AlertTriangle, Car, FileText, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const maintenanceSchema = z.object({
    vehicleId: z.string().min(1, 'Veículo é obrigatório'),
    type: z.enum(['preventive', 'corrective', 'inspection']),
    priority: z.enum(['low', 'medium', 'high']),
    description: z.string().min(5, 'Descrição deve ter pelo menos 5 caracteres'),
    scheduledDate: z.string().min(1, 'Data é obrigatória'),
    workshop: z.string().optional(),
    estimatedCost: z.coerce.number().min(0).optional(),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

interface NewMaintenanceFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

// Mock vehicles for selection
const mockVehicles = [
    { value: '1', label: 'ABC-1234 - Fiat Strada' },
    { value: '2', label: 'XYZ-5678 - Chevrolet Spin' },
    { value: '3', label: 'DEF-9012 - VW Saveiro' },
    { value: '4', label: 'GHI-3456 - Renault Duster' },
];

export function NewMaintenanceForm({ onSuccess, onCancel }: NewMaintenanceFormProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(maintenanceSchema),
        defaultValues: {
            type: 'preventive',
            priority: 'medium',
            scheduledDate: new Date().toISOString().split('T')[0],
        },
    });

    const onSubmit = async (data: MaintenanceFormData) => {
        try {
            console.log('Form data:', data);
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
            toast.success('Manutenção agendada com sucesso!');
            onSuccess();
        } catch (error) {
            toast.error('Erro ao agendar manutenção.');
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
                        />
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                            <SGFSelect
                                label="Tipo"
                                options={[
                                    { value: 'preventive', label: 'Preventiva' },
                                    { value: 'corrective', label: 'Corretiva' },
                                    { value: 'inspection', label: 'Vistoria' },
                                ]}
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.type?.message}
                                fullWidth
                            />
                        )}
                    />

                    <Controller
                        name="priority"
                        control={control}
                        render={({ field }) => (
                            <SGFSelect
                                label="Prioridade"
                                options={[
                                    { value: 'low', label: 'Baixa' },
                                    { value: 'medium', label: 'Média' },
                                    { value: 'high', label: 'Alta' },
                                ]}
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.priority?.message}
                                fullWidth
                            />
                        )}
                    />
                </div>

                <SGFInput
                    label="Data Agendada"
                    type="date"
                    {...register('scheduledDate')}
                    error={errors.scheduledDate?.message}
                    fullWidth
                    icon={Calendar}
                />

                <SGFInput
                    label="Oficina (Opcional)"
                    placeholder="Nome da oficina ou concessionária"
                    {...register('workshop')}
                    error={errors.workshop?.message}
                    fullWidth
                    icon={Wrench}
                />

                <div className="md:col-span-2">
                    <SGFInput
                        label="Descrição do Problema / Serviço"
                        placeholder="Ex: Troca de óleo, barulho na suspensão, etc."
                        {...register('description')}
                        error={errors.description?.message}
                        fullWidth
                        icon={FileText}
                    />
                </div>

                <SGFInput
                    label="Custo Estimado (Opcional)"
                    type="number"
                    placeholder="0,00"
                    {...register('estimatedCost')}
                    error={errors.estimatedCost?.message}
                    fullWidth
                    icon={DollarSign}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <SGFButton type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                    Cancelar
                </SGFButton>
                <SGFButton type="submit" icon={isSubmitting ? Loader2 : Save} disabled={isSubmitting}>
                    {isSubmitting ? 'Agendando...' : 'Agendar Manutenção'}
                </SGFButton>
            </div>
        </form>
    );
}
