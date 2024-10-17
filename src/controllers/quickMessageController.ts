import { Request, Response } from 'express';
import QuickMessageModel from '../models/QuickMessage';

export const createQuickMessage = async (req: Request, res: Response) => {
  try {
    console.log('Corpo da requisição:', req.body);
    const { userId, title, text } = req.body;
    
    if (!userId || !title || !text) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando' });
    }

    console.log('Criando nova mensagem rápida');
    const newQuickMessage = new QuickMessageModel({ userId, title, text });
    
    console.log('Salvando mensagem rápida');
    await newQuickMessage.save();
    
    console.log('Mensagem rápida salva com sucesso');
    res.status(201).json({ message: 'Mensagem rápida criada com sucesso', quickMessage: newQuickMessage });
  } catch (error: unknown) {
    console.error('Erro ao criar mensagem rápida:', error);
    res.status(500).json({ 
      message: 'Erro ao criar mensagem rápida', 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

export const getQuickMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const quickMessages = await QuickMessageModel.find({ userId });
    res.status(200).json(quickMessages);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar mensagens rápidas', error });
  }
};

export const updateQuickMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, text } = req.body;
    const updatedQuickMessage = await QuickMessageModel.findByIdAndUpdate(id, { title, text }, { new: true });
    if (!updatedQuickMessage) {
      return res.status(404).json({ message: 'Mensagem rápida não encontrada' });
    }
    res.status(200).json({ message: 'Mensagem rápida atualizada com sucesso', quickMessage: updatedQuickMessage });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar mensagem rápida', error });
  }
};

export const deleteQuickMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedQuickMessage = await QuickMessageModel.findByIdAndDelete(id);
    if (!deletedQuickMessage) {
      return res.status(404).json({ message: 'Mensagem rápida não encontrada' });
    }
    res.status(200).json({ message: 'Mensagem rápida excluída com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir mensagem rápida', error });
  }
};
