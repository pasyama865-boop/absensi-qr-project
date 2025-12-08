import pool from '../config/db.js';
export const getAllTahunAjaran = async (req, res, next) => {
    try {
        const query = 'SELECT ta_id AS id, nama_ta AS nama, is_active FROM tahun_ajaran ORDER BY ta_id DESC';
        const result = await pool.query(query);
        res.status(200).json(result.rows); 
    } catch (error) {
        console.error("Database Error di getAllTahunAjaran:", error);
        next(error); 
    }
};

export const createTahunAjaran = async (req, res, next) => {
    const { nama, is_active } = req.body; 
    
    if (!nama || nama.trim() === '') {
        return res.status(400).json({ message: "Nama Tahun Ajaran wajib diisi." });
    }

    try {
        const query = `
            INSERT INTO tahun_ajaran (nama_ta, is_active)
            VALUES ($1, $2)
            RETURNING ta_id AS id, nama_ta AS nama, is_active;
        `;
        const values = [nama, is_active || false]; 
        
        const result = await pool.query(query, values);
        
        res.status(201).json({
            message: "Tahun Ajaran berhasil ditambahkan.",
            data: result.rows[0]
        });
        
    } catch (error) {
        if (error.code === '23505') { 
            return res.status(400).json({ message: "Tahun Ajaran dengan nama ini sudah ada." });
        }
        console.error("Database Error di createTahunAjaran:", error);
        next(error); 
    }
};

export const updateTahunAjaran = async (req, res, next) => {
    const { id } = req.params;
    const { nama, is_active } = req.body; 

    if (!nama || nama.trim() === '') {
        return res.status(400).json({ message: "Nama Tahun Ajaran wajib diisi." });
    }

    try {
        const query = `
            UPDATE tahun_ajaran 
            SET nama_ta = $1, is_active = $2 
            WHERE ta_id = $3
            RETURNING ta_id AS id, nama_ta AS nama, is_active;
        `;
        const values = [nama, is_active || false, id];
        
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: `Tahun Ajaran dengan ID ${id} tidak ditemukan.` });
        }
        
        res.status(200).json({
            message: "Tahun Ajaran berhasil diperbarui.",
            data: result.rows[0]
        });
        
    } catch (error) {
        if (error.code === '23505') { 
            return res.status(400).json({ message: "Nama Tahun Ajaran sudah ada." });
        }
        console.error("Database Error di updateTahunAjaran:", error);
        next(error); 
    }
};

export const deleteTahunAjaran = async (req, res, next) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM tahun_ajaran WHERE ta_id = $1';
        const result = await pool.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: `Tahun Ajaran dengan ID ${id} tidak ditemukan.` });
        }
        
        res.status(200).json({ message: "Tahun Ajaran berhasil dihapus." });
        
    } catch (error) {
        console.error("Database Error di deleteTahunAjaran:", error);
        if (error.code === '23503') { // Foreign Key violation
             return res.status(409).json({ message: "Gagal menghapus: Tahun Ajaran ini masih digunakan oleh data lain." });
        }
        next(error); 
    }
};