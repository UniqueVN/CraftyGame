MapObject = BaseEntity.extend(
{
	default :
	{
		Width : 1,
		Height : 1
	},

	initialize: function()
	{
		this.X = 0;
		this.Y = 0;
	}
});