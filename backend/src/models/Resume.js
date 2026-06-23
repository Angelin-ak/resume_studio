const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Resume = sequelize.define('Resume', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  templateId: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'clean-ats'
  },
  theme: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      primaryColor: '#0f766e',
      secondaryColor: '#1e293b',
      textColor: '#1f2937',
      backgroundColor: '#ffffff',
      fontFamily: 'Inter',
      fontSize: 'medium',
      spacing: 'normal',
      sectionVisibility: {
        summary: true,
        work: true,
        education: true,
        skills: true,
        projects: true,
        certifications: true
      }
    }
  },
  basics: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      name: '',
      label: '',
      email: '',
      phone: '',
      url: '',
      location: '',
      summary: '',
      image: ''
    }
  },
  work: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  education: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  skills: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  projects: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  certifications: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  references: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  }
});

module.exports = Resume;
