// src/routes/expenses.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { ensureAdmin } from "../middlewares/auth.ts";

const prisma = new PrismaClient();
const router = Router();

// Get all expenses with filtering and pagination
router.get("/", ensureAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      status, 
      startDate, 
      endDate,
      search 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { vendor: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          admin: {
            select: {
              id: true,
              email: true
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.expense.count({ where })
    ]);

    res.json({
      expenses,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

// Get single expense by ID
router.get("/:id", ensureAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        admin: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json(expense);
  } catch (error) {
    console.error("Error fetching expense:", error);
    res.status(500).json({ error: "Failed to fetch expense" });
  }
});

// Create new expense
router.post("/", ensureAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      amount,
      currency = "INR",
      date,
      vendor,
      receiptUrl
    } = req.body;

    if (!title || !category || !amount || !date) {
      return res.status(400).json({ 
        error: "Missing required fields: title, category, amount, date" 
      });
    }

    const expense = await prisma.expense.create({
      data: {
        title,
        description,
        category,
        amount: parseFloat(amount),
        currency,
        date: new Date(date),
        vendor,
        receiptUrl,
        createdBy: req.admin?.sub || req.admin?.id || ""
      },
      include: {
        admin: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({ error: "Failed to create expense" });
  }
});

// Update expense
router.patch("/:id", ensureAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      amount,
      currency,
      date,
      vendor,
      receiptUrl,
      status
    } = req.body;

    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (currency !== undefined) updateData.currency = currency;
    if (date !== undefined) updateData.date = new Date(date);
    if (vendor !== undefined) updateData.vendor = vendor;
    if (receiptUrl !== undefined) updateData.receiptUrl = receiptUrl;
    
      if (status !== undefined) {
        updateData.status = status;
        if (status === "approved") {
          updateData.approvedBy = req.admin?.sub || req.admin?.id;
          updateData.approvedAt = new Date();
        }
      }

    const expense = await prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        admin: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    res.json(expense);
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ error: "Failed to update expense" });
  }
});

// Delete expense
router.delete("/:id", ensureAdmin, async (req, res) => {
  try {
    await prisma.expense.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

// Get expense statistics
router.get("/stats/summary", ensureAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where: any = {};
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const [
      totalExpenses,
      pendingExpenses,
      approvedExpenses,
      categoryStats
    ] = await Promise.all([
      prisma.expense.aggregate({
        where,
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.expense.aggregate({
        where: { ...where, status: "pending" },
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.expense.aggregate({
        where: { ...where, status: "approved" },
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.expense.groupBy({
        by: ['category'],
        where,
        _sum: { amount: true },
        _count: { id: true }
      })
    ]);

    res.json({
      total: {
        amount: totalExpenses._sum.amount || 0,
        count: totalExpenses._count.id || 0
      },
      pending: {
        amount: pendingExpenses._sum.amount || 0,
        count: pendingExpenses._count.id || 0
      },
      approved: {
        amount: approvedExpenses._sum.amount || 0,
        count: approvedExpenses._count.id || 0
      },
      byCategory: categoryStats.map(stat => ({
        category: stat.category,
        amount: stat._sum.amount || 0,
        count: stat._count.id || 0
      }))
    });
  } catch (error) {
    console.error("Error fetching expense statistics:", error);
    res.status(500).json({ error: "Failed to fetch expense statistics" });
  }
});

export default router;
