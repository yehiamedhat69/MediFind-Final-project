// src/controllers/medicineSearchController.js
const Medicine = require("../models/medicine");
const Inventory = require("../models/Inventory");
const Pharmacy = require("../models/Pharmacy");

/**
 * GET /api/search/medicine
 */
const searchMedicineAvailability = async (req, res) => {
  try {
    const {
      name,
      latitude,
      longitude,
      radius = 10,
      page = 1,
      limit = 10,
      sortBy = 'distance',
      minQuantity = 1,
      maxPrice,
      category
    } = req.query;

    // === 1. Validate required parameters ===
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Medicine name is required and must be at least 2 characters"
      });
    }

    // === 2. Validate pagination ===
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    if (isNaN(pageNumber) || pageNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "Page must be a positive number"
      });
    }

    if (isNaN(limitNumber) || limitNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "Limit must be a positive number"
      });
    }

    // === 3. Build medicine search query ===
    const medicineQuery = {
      isActive: true,
      $or: [
        { name: { $regex: name.trim(), $options: 'i' } },
        { genericName: { $regex: name.trim(), $options: 'i' } }
      ]
    };

    if (category) {
      medicineQuery.category = { $regex: category.trim(), $options: 'i' };
    }

    // === 4. Find medicines matching the search ===
    const medicines = await Medicine.find(medicineQuery)
      .select('_id name genericName category description')
      .limit(20);

    if (medicines.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No medicines found matching your search",
        data: [],
        pagination: {
          currentPage: pageNumber,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limitNumber
        },
        summary: {
          totalPharmaciesFound: 0,
          medicinesFound: 0
        }
      });
    }

    const medicineIds = medicines.map(m => m._id);

    // === 5. Build inventory query ===
    const inventoryQuery = {
      medicineId: { $in: medicineIds },
      availability: true,
      quantity: { $gt: parseInt(minQuantity) || 0 }
    };

    if (maxPrice && !isNaN(maxPrice)) {
      inventoryQuery.price = { $lte: parseFloat(maxPrice) };
    }

    // === 6. Get total count for pagination ===
    const totalItems = await Inventory.countDocuments(inventoryQuery);

    if (totalItems === 0) {
      return res.status(200).json({
        success: true,
        message: "Medicine found but not available in any pharmacy",
        data: [],
        pagination: {
          currentPage: pageNumber,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limitNumber
        },
        summary: {
          totalPharmaciesFound: 0,
          medicinesFound: medicines.length,
          medicines: medicines.map(m => ({
            id: m._id,
            name: m.name,
            genericName: m.genericName,
            category: m.category
          }))
        }
      });
    }

    // === 7. Build aggregation pipeline ===
    const skip = (pageNumber - 1) * limitNumber;

    // Check if location is provided for distance sorting
    let useLocation = false;
    let userLat = null;
    let userLng = null;

    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        useLocation = true;
        userLat = lat;
        userLng = lng;
      }
    }

    // Build the aggregation pipeline
    let pipeline = [
      { $match: inventoryQuery },
      
      // Join with Pharmacy
      {
        $lookup: {
          from: 'pharmacies',
          localField: 'pharmacyId',
          foreignField: '_id',
          as: 'pharmacy'
        }
      },
      { $unwind: '$pharmacy' },
      
      // Filter out inactive pharmacies
      { $match: { 'pharmacy.isActive': true } },
      
      // Join with Medicine
      {
        $lookup: {
          from: 'medicines',
          localField: 'medicineId',
          foreignField: '_id',
          as: 'medicine'
        }
      },
      { $unwind: '$medicine' },
      
      // Add distance if location is provided
      ...(useLocation ? [{
        $addFields: {
          distance: {
            $ifNull: [
              {
                $multiply: [
                  {
                    $divide: [
                      {
                        $sqrt: {
                          $add: [
                            { $pow: [{ $subtract: [{ $arrayElemAt: ['$pharmacy.location.coordinates', 0] }, userLng] }, 2] },
                            { $pow: [{ $subtract: [{ $arrayElemAt: ['$pharmacy.location.coordinates', 1] }, userLat] }, 2] }
                          ]
                        }
                      },
                      0.009
                    ]
                  },
                  111
                ]
              },
              null
            ]
          }
        }
      }] : []),
      
      // Add status field
      {
        $addFields: {
          status: {
            $cond: [
              { $and: [
                { $eq: ['$availability', true] },
                { $gt: ['$quantity', 0] }
              ]},
              'available',
              'unavailable'
            ]
          },
          inStock: {
            $cond: [
              { $gt: ['$quantity', 0] },
              true,
              false
            ]
          }
        }
      }
    ];

    // === 8. Add sorting ===
    if (useLocation && sortBy === 'distance') {
      pipeline.push({ $sort: { distance: 1 } });
    } else if (sortBy === 'price') {
      pipeline.push({ $sort: { price: 1 } });
    } else if (sortBy === 'quantity') {
      pipeline.push({ $sort: { quantity: -1 } });
    } else if (sortBy === 'name') {
      pipeline.push({ $sort: { 'pharmacy.name': 1 } });
    } else {
      // Default: sort by distance if location provided, otherwise by name
      if (useLocation) {
        pipeline.push({ $sort: { distance: 1 } });
      } else {
        pipeline.push({ $sort: { 'pharmacy.name': 1 } });
      }
    }

    // === 9. Add pagination ===
    const countPipeline = [...pipeline, { $count: 'total' }];
    const dataPipeline = [
      ...pipeline,
      { $skip: skip },
      { $limit: limitNumber },
      {
        $project: {
          _id: 0,
          inventoryId: '$_id',
          pharmacy: {
            id: '$pharmacy._id',
            name: '$pharmacy.name',
            address: '$pharmacy.address',
            phone: '$pharmacy.phone',
            location: '$pharmacy.location',
            isActive: '$pharmacy.isActive'
          },
          medicine: {
            id: '$medicine._id',
            name: '$medicine.name',
            genericName: '$medicine.genericName',
            category: '$medicine.category',
            description: '$medicine.description'
          },
          quantity: 1,
          price: 1,
          availability: 1,
          status: 1,
          inStock: 1,
          distance: 1,
          updatedAt: 1
        }
      }
    ];

    // === 10. Execute queries ===
    const [countResult, results] = await Promise.all([
      Inventory.aggregate(countPipeline),
      Inventory.aggregate(dataPipeline)
    ]);

    const totalCount = countResult.length > 0 ? countResult[0].total : 0;

    // === 11. Get medicine summary ===
    const medicineSummary = medicines.map(m => ({
      id: m._id,
      name: m.name,
      genericName: m.genericName,
      category: m.category
    }));

    // === 12. Format response ===
    const response = {
      success: true,
      data: results,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / limitNumber),
        totalItems: totalCount,
        itemsPerPage: limitNumber
      },
      summary: {
        totalPharmaciesFound: totalCount,
        medicinesFound: medicines.length,
        medicines: medicineSummary
      },
      searchParams: {
        name: name.trim(),
        category: category || null,
        location: useLocation ? {
          latitude: userLat,
          longitude: userLng,
          radius: parseFloat(radius)
        } : null,
        sortBy,
        minQuantity: parseInt(minQuantity) || 1,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to search for medicine availability",
      error: error.message
    });
  }
};

/**
 * البحث عن صيدليات قريبة تتوفر فيها أدوية معينة
 * GET /api/search/nearby
 */
const searchNearbyPharmacies = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      radius = 5,
      page = 1,
      limit = 10,
      search
    } = req.query;

    // === 1. Validate location ===
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required"
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude"
      });
    }

    // === 2. Validate pagination ===
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    if (isNaN(pageNumber) || pageNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "Page must be a positive number"
      });
    }

    if (isNaN(limitNumber) || limitNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "Limit must be a positive number"
      });
    }

    // === 3. Build geo query ===
    const geoQuery = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
        }
      },
      isActive: true
    };

    // === 4. Get pharmacies with inventory summary ===
    const skip = (pageNumber - 1) * limitNumber;

    let pharmacies = await Pharmacy.find(geoQuery)
      .select('_id name address phone location')
      .skip(skip)
      .limit(limitNumber);

    if (pharmacies.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No pharmacies found nearby",
        data: [],
        pagination: {
          currentPage: pageNumber,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limitNumber
        }
      });
    }

    // === 5. Get inventory summary for each pharmacy ===
    const pharmacyIds = pharmacies.map(p => p._id);

    const inventorySummary = await Inventory.aggregate([
      { 
        $match: { 
          pharmacyId: { $in: pharmacyIds },
          availability: true,
          quantity: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: '$pharmacyId',
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          medicines: { 
            $push: {
              medicineId: '$medicineId',
              quantity: '$quantity',
              price: '$price'
            }
          }
        }
      }
    ]);

    // === 6. Join inventory summary with pharmacies ===
    const summaryMap = {};
    inventorySummary.forEach(item => {
      summaryMap[item._id.toString()] = {
        totalItems: item.totalItems,
        totalQuantity: item.totalQuantity
      };
    });

    // === 7. Format response ===
    const formattedData = pharmacies.map(pharmacy => ({
      id: pharmacy._id,
      name: pharmacy.name,
      address: pharmacy.address,
      phone: pharmacy.phone,
      location: pharmacy.location,
      distance: calculateDistance(lat, lng, pharmacy.location.coordinates[1], pharmacy.location.coordinates[0]),
      inventorySummary: summaryMap[pharmacy._id.toString()] || {
        totalItems: 0,
        totalQuantity: 0
      }
    }));

    // === 8. Apply search filter if provided ===
    let filteredData = formattedData;
    if (search && search.trim()) {
      const searchLower = search.trim().toLowerCase();
      filteredData = formattedData.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.address.toLowerCase().includes(searchLower)
      );
    }

    const totalItems = filteredData.length;

    res.status(200).json({
      success: true,
      data: filteredData,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalItems / limitNumber),
        totalItems,
        itemsPerPage: limitNumber
      },
      searchParams: {
        latitude: lat,
        longitude: lng,
        radius: parseFloat(radius),
        search: search || null
      }
    });

  } catch (error) {
    console.error('Nearby search error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to search nearby pharmacies",
      error: error.message
    });
  }
};

/**
 * الحصول على تفاصيل توفر دواء معين في صيدلية محددة
 * GET /api/search/medicine/:medicineId/pharmacy/:pharmacyId
 */
const getMedicineAvailabilityInPharmacy = async (req, res) => {
  try {
    const { medicineId, pharmacyId } = req.params;

    // === 1. Check if medicine exists ===
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found"
      });
    }

    // === 2. Check if pharmacy exists ===
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy not found"
      });
    }

    // === 3. Check inventory ===
    const inventory = await Inventory.findOne({
      pharmacyId,
      medicineId,
      availability: true
    })
      .populate('pharmacyId', 'name address phone location')
      .populate('medicineId', 'name genericName category description');

    if (!inventory) {
      return res.status(200).json({
        success: true,
        available: false,
        message: "Medicine is not available in this pharmacy",
        medicine: {
          id: medicine._id,
          name: medicine.name,
          genericName: medicine.genericName
        },
        pharmacy: {
          id: pharmacy._id,
          name: pharmacy.name,
          address: pharmacy.address
        }
      });
    }

    // === 4. Return availability details ===
    res.status(200).json({
      success: true,
      available: true,
      medicine: {
        id: medicine._id,
        name: medicine.name,
        genericName: medicine.genericName,
        category: medicine.category,
        description: medicine.description
      },
      pharmacy: {
        id: pharmacy._id,
        name: pharmacy.name,
        address: pharmacy.address,
        phone: pharmacy.phone,
        location: pharmacy.location
      },
      inventory: {
        quantity: inventory.quantity,
        price: inventory.price,
        availability: inventory.availability,
        inStock: inventory.quantity > 0,
        lastUpdated: inventory.updatedAt
      }
    });

  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to check medicine availability",
      error: error.message
    });
  }
};

/**
 * الحصول على أدوية متوفرة في صيدلية معينة
 * GET /api/search/pharmacy/:pharmacyId/medicines
 */
const getPharmacyMedicines = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { 
      page = 1, 
      limit = 20, 
      search,
      category,
      minPrice,
      maxPrice,
      inStock 
    } = req.query;

    // === 1. Check if pharmacy exists ===
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy not found"
      });
    }

    // === 2. Validate pagination ===
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    if (isNaN(pageNumber) || pageNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "Page must be a positive number"
      });
    }

    if (isNaN(limitNumber) || limitNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "Limit must be a positive number"
      });
    }

    // === 3. Build query ===
    const query = { pharmacyId, availability: true };

    if (inStock === 'true') {
      query.quantity = { $gt: 0 };
    }

    // === 4. Build aggregation pipeline ===
    let pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'medicines',
          localField: 'medicineId',
          foreignField: '_id',
          as: 'medicine'
        }
      },
      { $unwind: '$medicine' },
      { $match: { 'medicine.isActive': true } }
    ];

    // === 5. Add search filters ===
    if (search && search.trim()) {
      pipeline.push({
        $match: {
          $or: [
            { 'medicine.name': { $regex: search.trim(), $options: 'i' } },
            { 'medicine.genericName': { $regex: search.trim(), $options: 'i' } }
          ]
        }
      });
    }

    if (category) {
      pipeline.push({
        $match: {
          'medicine.category': { $regex: category.trim(), $options: 'i' }
        }
      });
    }

    if (minPrice && !isNaN(minPrice)) {
      pipeline.push({
        $match: { price: { $gte: parseFloat(minPrice) } }
      });
    }

    if (maxPrice && !isNaN(maxPrice)) {
      pipeline.push({
        $match: { price: { $lte: parseFloat(maxPrice) } }
      });
    }

    // === 6. Add pagination ===
    const countPipeline = [...pipeline, { $count: 'total' }];
    const dataPipeline = [
      ...pipeline,
      { $sort: { 'medicine.name': 1 } },
      { $skip: (pageNumber - 1) * limitNumber },
      { $limit: limitNumber },
      {
        $project: {
          _id: 0,
          inventoryId: '$_id',
          medicine: {
            id: '$medicine._id',
            name: '$medicine.name',
            genericName: '$medicine.genericName',
            category: '$medicine.category',
            description: '$medicine.description'
          },
          quantity: 1,
          price: 1,
          availability: 1,
          inStock: {
            $cond: [{ $gt: ['$quantity', 0] }, true, false]
          },
          updatedAt: 1
        }
      }
    ];

    // === 7. Execute queries ===
    const [countResult, results] = await Promise.all([
      Inventory.aggregate(countPipeline),
      Inventory.aggregate(dataPipeline)
    ]);

    const totalCount = countResult.length > 0 ? countResult[0].total : 0;

    res.status(200).json({
      success: true,
      pharmacy: {
        id: pharmacy._id,
        name: pharmacy.name,
        address: pharmacy.address,
        phone: pharmacy.phone
      },
      data: results,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / limitNumber),
        totalItems: totalCount,
        itemsPerPage: limitNumber
      }
    });

  } catch (error) {
    console.error('Get pharmacy medicines error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to get pharmacy medicines",
      error: error.message
    });
  }
};

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

module.exports = {
  searchMedicineAvailability,
  searchNearbyPharmacies,
  getMedicineAvailabilityInPharmacy,
  getPharmacyMedicines
};