import { InstallmentStatus, InvoiceKind } from "@/src/generated/client"
import { z } from "zod"

export const BillingProfileSchema = z.object({
  legalName: z.string().min(1, "Razao Social e obrigatoria"),
  tradeName: z.string().optional(),
  taxId: z.string().min(1, "CPF/CNPJ e obrigatorio"),
  billingEmail: z.string().email("E-mail invalido"),
  billingPhone: z.string().optional(),

  addressStreet: z.string().min(1, "Rua e obrigatoria"),
  addressNumber: z.string().min(1, "Numero e obrigatorio"),
  addressComplement: z.string().optional(),
  addressDistrict: z.string().min(1, "Bairro e obrigatorio"),
  addressCity: z.string().min(1, "Cidade e obrigatoria"),
  addressState: z.string().length(2, "Estado (UF) deve ter 2 caracteres"),
  addressZipCode: z.string().min(1, "CEP e obrigatorio"),
})

export const CreateInstallmentSchema = z.object({
  number: z.number().int().positive(),
  amount: z.number().positive(),
  dueDate: z.date(),
})

export const CreateInvoiceSchema = z
  .object({
    title: z.string().min(1, "Titulo e obrigatorio"),
    description: z.string().optional(),
    projectId: z.string().optional(),
    clientId: z.string().optional(),
    kind: z.nativeEnum(InvoiceKind).optional().default(InvoiceKind.PROJECT),
    proposalId: z.string().optional(),
    documentId: z.string().optional(),
    totalAmount: z.number().positive(),
    currency: z.string().default("BRL"),
    dueDate: z.date().optional(),
    installments: z
      .array(CreateInstallmentSchema)
      .min(1, "Pelo menos uma parcela e obrigatoria"),
  })
  .refine((data) => Boolean(data.projectId || data.clientId), {
    message: "Projeto ou cliente e obrigatorio",
    path: ["clientId"],
  })

export const RegisterPaymentEventSchema = z.object({
  installmentId: z.string(),
  type: z.string().min(1, "Tipo de pagamento e obrigatorio"),
  amount: z.number().positive(),
  date: z.date().default(new Date()),
  note: z.string().optional(),
  attachmentUrl: z.string().url().optional(),
  attachmentKey: z.string().optional(),
})

export const UpdateInstallmentStatusSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(InstallmentStatus),
  paidAt: z.date().optional(),
})

export type BillingProfileInput = z.infer<typeof BillingProfileSchema>
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>
export type RegisterPaymentEventInput = z.infer<
  typeof RegisterPaymentEventSchema
>
